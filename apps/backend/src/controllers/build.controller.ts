import { getUserId } from "../utils/helper-functions";
import { prisma } from "@repo/db";
import { env } from "../constants/env";
import Sandbox from "@e2b/code-interpreter";
import { resolveUserExpoToken } from "../utils/credential-client";

function sanitizePackageName(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `com.anvilly.${clean.length > 0 ? clean : "app" + Math.random().toString(36).substring(2, 8)}`;
}

async function runSandboxCommand(
  sandbox: Sandbox,
  cmd: string,
  opts?: { timeoutMs?: number }
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  try {
    const res = await sandbox.commands.run(cmd, opts);
    return {
      exitCode: res.exitCode ?? 0,
      stdout: res.stdout || "",
      stderr: res.stderr || "",
    };
  } catch (err: any) {
    return {
      exitCode: err.result?.exitCode ?? err.exitCode ?? 1,
      stdout: err.result?.stdout || err.stdout || "",
      stderr: err.result?.stderr || err.stderr || err.message || "",
    };
  }
}

async function verifyEasProjectId(projectId: string, token: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.expo.dev/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `query VerifyApp($id: String!) {
          app {
            byId(appId: $id) {
              id
            }
          }
        }`,
        variables: { id: projectId },
      }),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as any;
    return !!json?.data?.app?.byId?.id;
  } catch {
    return false;
  }
}

/**
 * Trigger EAS Build for an Expo project (APK or AAB)
 */
export const triggerProjectBuild = async (
  req: Request,
  params: Record<string, string>
): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json({ success: false, message: "User id not found" }, { status: 403 });
  }

  const projectId = params.projectId;
  if (!projectId) {
    return Response.json({ success: false, message: "Project ID is required" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    return Response.json({ success: false, message: "Project not found or access denied" }, { status: 404 });
  }

  if (project.template !== "node_react_native_expo") {
    return Response.json(
      { success: false, message: "Cloud builds are only supported for Expo React Native projects" },
      { status: 400 }
    );
  }

  // Check if user has an active Expo Access Token
  const expoCred = await resolveUserExpoToken(userId);
  if (!expoCred || !expoCred.token) {
    return Response.json(
      {
        success: false,
        code: "EXPO_TOKEN_REQUIRED",
        message: "Please configure your Expo Access Token first before deploying.",
      },
      { status: 400 }
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // buildType: "APK" | "AAB"
  const rawType = (body.buildType || "APK").toUpperCase();
  const buildType = rawType === "AAB" ? "AAB" : "APK";
  const easProfile = buildType === "APK" ? "preview" : "production";
  const enumProfile = buildType === "APK" ? "PREVIEW" : "PRODUCTION";

  // Prevent multiple active builds simultaneously for the same project
  try {
    const activeBuild = await (prisma as any).projectBuild.findFirst({
      where: {
        projectId,
        status: { in: ["QUEUED", "IN_PROGRESS"] },
      },
    });

    if (activeBuild) {
      return Response.json(
        {
          success: false,
          message: "A build is already in progress for this project.",
          build: activeBuild,
        },
        { status: 409 }
      );
    }
  } catch (e: any) {
    console.warn("[triggerProjectBuild] Check activeBuild notice:", e?.message);
  }

  try {
    // 1. Connect to project sandbox
    const sandbox = await Sandbox.connect(project.sandboxId);
    await sandbox.setTimeout(env.sandboxTimeoutMs);

    // 2. Ensure /home/user/app/eas.json exists with preview (apk) and production (aab) profiles
    const easConfig = {
      cli: {
        version: ">= 15.0.0",
        appVersionSource: "remote",
      },
      build: {
        development: {
          developmentClient: true,
          distribution: "internal",
        },
        preview: {
          distribution: "internal",
          android: {
            buildType: "apk",
          },
        },
        production: {
          android: {
            buildType: "app-bundle",
          },
        },
      },
    };

    await sandbox.files.write("/home/user/app/eas.json", JSON.stringify(easConfig, null, 2));

    // 3. Ensure app.json has a valid android.package identifier and slug
    let hasEasProjectId = false;
    try {
      const appJsonRaw = await sandbox.files.read("/home/user/app/app.json");
      const appJson = JSON.parse(appJsonRaw);
      if (!appJson.expo) appJson.expo = {};
      if (!appJson.expo.android) appJson.expo.android = {};

      if (!appJson.expo.android.package) {
        const pkg = sanitizePackageName(project.title || "anvillyapp");
        appJson.expo.android.package = pkg;
      }

      if (project.title) {
        const cleanSlug = project.title.toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/^-+|-+$/g, "") || "anvilly-app";
        if (!appJson.expo.slug || appJson.expo.slug === "app") {
          appJson.expo.slug = cleanSlug;
        }
        if (!appJson.expo.name || appJson.expo.name === "app") {
          appJson.expo.name = project.title;
        }
      }

      // Check if existing EAS project ID is valid and accessible on Expo
      const existingProjectId = appJson.expo?.extra?.eas?.projectId;
      if (existingProjectId) {
        const isValid = await verifyEasProjectId(existingProjectId, expoCred.token);
        if (!isValid) {
          console.warn(
            `[triggerProjectBuild] Stale or inaccessible EAS projectId "${existingProjectId}" detected. Removing from app.json.`
          );
          delete appJson.expo.extra.eas.projectId;
          if (appJson.expo.extra.eas && Object.keys(appJson.expo.extra.eas).length === 0) {
            delete appJson.expo.extra.eas;
          }
          if (appJson.expo.extra && Object.keys(appJson.expo.extra).length === 0) {
            delete appJson.expo.extra;
          }
        }
      }

      if (expoCred.username) {
        appJson.expo.owner = expoCred.username;
      }

      hasEasProjectId = !!appJson.expo?.extra?.eas?.projectId;
      await sandbox.files.write("/home/user/app/app.json", JSON.stringify(appJson, null, 2));
    } catch (e: any) {
      console.warn("[triggerProjectBuild] Notice updating app.json:", e?.message);
    }

    // 4. Ensure Git repository is initialized and clean (required by EAS CLI)
    await runSandboxCommand(
      sandbox,
      `cd /home/user/app && ` +
        `git config user.name "Anvilly" && ` +
        `git config user.email "bot@anvilly.dev" && ` +
        `(git rev-parse --is-inside-work-tree >/dev/null 2>&1 || git init) && ` +
        `git add -A && ` +
        `git commit -m "Anvilly EAS snapshot" --allow-empty`
    );

    // 5. Initialize EAS Project if not already linked
    if (!hasEasProjectId) {
      const accountFlag = expoCred.username ? `--account "${expoCred.username}"` : "";
      const initCmd =
        `cd /home/user/app && ` +
        `EXPO_TOKEN="${expoCred.token}" npx --yes eas-cli init ${accountFlag} --force --non-interactive`;

      console.log(`[triggerProjectBuild] Initializing EAS project for @${expoCred.username || "user"}...`);
      const initResult = await runSandboxCommand(sandbox, initCmd, { timeoutMs: 60000 });
      if (initResult.exitCode !== 0) {
        console.error("[triggerProjectBuild] eas init failed exit code:", initResult.exitCode, initResult.stderr || initResult.stdout);
        const cleanedError = (initResult.stderr || initResult.stdout || "Failed to initialize EAS project")
          .replace(new RegExp(expoCred.token, "g"), "[REDACTED_TOKEN]");
        return Response.json(
          {
            success: false,
            message: `EAS project initialization failed: ${cleanedError.slice(0, 300)}`,
          },
          { status: 500 }
        );
      }

      // Re-commit any files modified by eas init (e.g. app.json)
      await runSandboxCommand(
        sandbox,
        `cd /home/user/app && ` +
          `git add -A && ` +
          `git commit -m "Configure EAS project" --allow-empty`
      );
    }

    // 6. Execute EAS CLI with --no-wait and --json
    // Cloud compilation happens asynchronously on Expo's builder machines.
    const easCmd =
      `cd /home/user/app && ` +
      `EXPO_TOKEN="${expoCred.token}" npx --yes eas-cli build ` +
      `--platform android ` +
      `--profile ${easProfile} ` +
      `--non-interactive ` +
      `--no-wait ` +
      `--json`;

    const cmdResult = await runSandboxCommand(sandbox, easCmd, { timeoutMs: 120000 });

    const stdout = cmdResult.stdout || "";
    const stderr = cmdResult.stderr || "";

    if (cmdResult.exitCode !== 0) {
      console.error("[triggerProjectBuild] EAS CLI error exit code:", cmdResult.exitCode, stderr || stdout);
      const cleanedError = (stderr || stdout || "Unknown EAS CLI build error")
        .replace(new RegExp(expoCred.token, "g"), "[REDACTED_TOKEN]");
      return Response.json(
        {
          success: false,
          message: `EAS Build initiation failed: ${cleanedError.slice(0, 300)}`,
        },
        { status: 500 }
      );
    }

    // 6. Parse JSON result to extract build ID and dashboard URL
    let expoBuildId: string | null = null;
    let expoBuildUrl: string | null = null;

    try {
      // Find JSON block in stdout
      const jsonMatch = stdout.match(/\[\s*\{[\s\S]*\}\s*\]/) || stdout.match(/\{[\s\S]*"id":[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const buildInfo = Array.isArray(parsed) ? parsed[0] : parsed;
        if (buildInfo) {
          expoBuildId = buildInfo.id || null;
          expoBuildUrl = buildInfo.buildUrl || null;
        }
      }
    } catch (parseErr) {
      console.warn("[triggerProjectBuild] Could not parse EAS JSON output:", parseErr);
    }

    // Fallback: extract URL regex from stdout if JSON parse was missed
    if (!expoBuildUrl) {
      const urlMatch = stdout.match(/https:\/\/expo\.dev\/accounts\/[^\s\)]+\/builds\/[a-f0-9\-]+/i);
      if (urlMatch) {
        expoBuildUrl = urlMatch[0];
        const segments = expoBuildUrl.split("/");
        expoBuildId = segments[segments.length - 1] || null;
      }
    }

    // 7. Persist ProjectBuild record in database
    let createdRecord = null;
    try {
      createdRecord = await (prisma as any).projectBuild.create({
        data: {
          projectId,
          platform: "ANDROID",
          buildType,
          profile: enumProfile,
          status: "QUEUED",
          expoBuildId,
          expoBuildUrl,
        },
      });
    } catch (dbErr: any) {
      console.warn("[triggerProjectBuild] Notice persisting build record:", dbErr?.message);
    }

    return Response.json(
      {
        success: true,
        message: `EAS ${buildType} build queued on Expo Dashboard`,
        build: createdRecord || {
          projectId,
          platform: "ANDROID",
          buildType,
          profile: enumProfile,
          status: "QUEUED",
          expoBuildId,
          expoBuildUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[triggerProjectBuild] Unexpected error:", error);
    return Response.json(
      { success: false, message: error?.message || "Failed to trigger EAS build" },
      { status: 500 }
    );
  }
};

/**
 * List all builds for a project and refresh active in-flight builds via Expo API
 */
export const getProjectBuilds = async (
  req: Request,
  params: Record<string, string>
): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json({ success: false, message: "User id not found" }, { status: 403 });
  }

  const projectId = params.projectId;
  if (!projectId) {
    return Response.json({ success: false, message: "Project ID is required" }, { status: 400 });
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    return Response.json({ success: false, message: "Project not found or access denied" }, { status: 404 });
  }

  try {
    const url = new URL(req.url);
    const limitQuery = url.searchParams.get("limit");
    const limit = limitQuery
      ? Math.min(Math.max(parseInt(limitQuery, 10) || 25, 1), 100)
      : 25;

    const totalCount = await (prisma as any).projectBuild.count({
      where: { projectId },
    });

    let builds = await (prisma as any).projectBuild.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Check if any build is in active state (QUEUED or IN_PROGRESS)
    const activeBuilds = builds.filter(
      (b: any) => (b.status === "QUEUED" || b.status === "IN_PROGRESS") && b.expoBuildId
    );

    if (activeBuilds.length > 0) {
      const expoCred = await resolveUserExpoToken(userId);
      if (expoCred?.token) {
        // Poll Expo API for status updates
        for (const build of activeBuilds) {
          try {
            const expoRes = await fetch("https://api.expo.dev/graphql", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${expoCred.token}`,
              },
              body: JSON.stringify({
                query: `query GetBuild($buildId: ID!) {
                  builds {
                    byId(buildId: $buildId) {
                    id
                    status
                    artifacts {
                      buildUrl
                    }
                    error {
                      message
                    }
                  }
                }
              }`,
                variables: { buildId: build.expoBuildId },
              }),
            });

            if (expoRes.ok) {
              const expoData = (await expoRes.json()) as any;
              const bData = expoData?.data?.builds?.byId;
              if (bData) {
                let newStatus: string = build.status;
                let artifactUrl: string | null = build.artifactUrl;
                let errorDetails: string | null = build.errorDetails;

                const statusLower = (bData.status || "").toLowerCase();
                if (statusLower === "finished") {
                  newStatus = "FINISHED";
                  artifactUrl = bData.artifacts?.buildUrl || null;
                } else if (statusLower === "errored") {
                  newStatus = "ERRORED";
                  errorDetails = bData.error?.message || "EAS Cloud Build failed";
                } else if (statusLower === "canceled") {
                  newStatus = "CANCELED";
                } else if (statusLower === "in-progress" || statusLower === "in_progress") {
                  newStatus = "IN_PROGRESS";
                }

                if (newStatus !== build.status || artifactUrl !== build.artifactUrl) {
                  await (prisma as any).projectBuild.update({
                    where: { id: build.id },
                    data: {
                      status: newStatus,
                      artifactUrl,
                      errorDetails,
                      updatedAt: new Date(),
                    },
                  });
                  build.status = newStatus;
                  build.artifactUrl = artifactUrl;
                  build.errorDetails = errorDetails;
                }
              }
            }
          } catch (pollErr) {
            console.warn(`[getProjectBuilds] Failed to poll status for build ${build.id}:`, pollErr);
          }
        }
      }
    }

    return Response.json({
      success: true,
      builds,
      totalCount,
      hasMore: totalCount > builds.length,
    });
  } catch (error: any) {
    console.error("[getProjectBuilds] Error fetching builds:", error);
    return Response.json(
      { success: false, message: error?.message || "Failed to fetch project builds", builds: [] },
      { status: 500 }
    );
  }
};

/**
 * Cancel an in-progress or queued EAS build
 */
export const cancelProjectBuild = async (
  req: Request,
  params: Record<string, string>
): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json({ success: false, message: "User id not found" }, { status: 403 });
  }

  const { projectId, buildId } = params;
  if (!projectId || !buildId) {
    return Response.json(
      { success: false, message: "Project ID and Build ID are required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    return Response.json({ success: false, message: "Project not found or access denied" }, { status: 404 });
  }

  const build = await (prisma as any).projectBuild.findFirst({
    where: { id: buildId, projectId },
  });

  if (!build) {
    return Response.json({ success: false, message: "Build not found" }, { status: 404 });
  }

  if (build.status !== "QUEUED" && build.status !== "IN_PROGRESS") {
    return Response.json(
      { success: false, message: `Build cannot be canceled because it is already ${build.status}` },
      { status: 400 }
    );
  }

  // Cancel build via Expo API if expoBuildId exists
  if (build.expoBuildId) {
    const expoCred = await resolveUserExpoToken(userId);
    if (expoCred?.token) {
      try {
        const expoRes = await fetch("https://api.expo.dev/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${expoCred.token}`,
          },
          body: JSON.stringify({
            query: `mutation CancelBuild($buildId: ID!) {
              build {
                cancelBuild(buildId: $buildId) {
                  id
                  status
                }
              }
            }`,
            variables: { buildId: build.expoBuildId },
          }),
        });

        if (!expoRes.ok) {
          const errText = await expoRes.text().catch(() => "");
          console.warn("[cancelProjectBuild] Expo API cancel response:", errText);
        }
      } catch (err) {
        console.warn("[cancelProjectBuild] Network error calling Expo cancel:", err);
      }
    }
  }

  // Update DB record to CANCELED
  const updatedBuild = await (prisma as any).projectBuild.update({
    where: { id: build.id },
    data: {
      status: "CANCELED",
      updatedAt: new Date(),
    },
  });

  return Response.json({
    success: true,
    message: "Build canceled successfully",
    build: updatedBuild,
  });
};

