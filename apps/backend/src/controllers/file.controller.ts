import { getUserId } from "../utils/helper-functions";
import { prisma } from "@repo/db";
import { env } from "../constants/env";
import Sandbox from "@e2b/code-interpreter";

export const getFileTree = async (
  req: Request,
  params: Record<string, string>
): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json(
      { success: false, message: "User id not found" },
      { status: 403 }
    );
  }

  const projectId = params.projectId;
  if (!projectId) {
    return Response.json(
      { success: false, message: "Project ID is required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return Response.json(
      { success: false, message: "Project not found" },
      { status: 404 }
    );
  }

  if (project.userId !== userId) {
    return Response.json(
      { success: false, message: "Access denied." },
      { status: 403 }
    );
  }

  try {
    const sandbox = await Sandbox.connect(project.sandboxId);
    await sandbox.setTimeout(env.sandboxTimeoutMs);

    const result = await sandbox.commands.run(
      `if [ -d /home/user/app ]; then ` +
        `find /home/user/app -type f ` +
        `-not -path '*/node_modules/*' ` +
        `-not -path '*/.next/*' ` +
        `-not -path '*/.git/*' ` +
        `-not -path '*/.turbo/*' ` +
        `-not -path '*/.cache/*' ` +
        `-not -path '*/.expo/*' ` +
        `-not -path '*/dist/*' ` +
        `-not -path '*/build/*' ` +
        `-not -name 'bun.lock' ` +
        `-not -name 'bun.lockb' ` +
        `-not -name 'package-lock.json' ` +
        `-not -name '*.log' ` +
        `| sort; fi`,
      { cwd: "/home/user/app", timeoutMs: 10000 }
    );

    const basePath = "/home/user/app/";
    const files = (result.stdout || "")
      .split("\n")
      .map((line: string) => line.replace(/\r/g, "").trim())
      .filter((line: string) => line.startsWith(basePath))
      .map((line: string) => line.slice(basePath.length))
      .filter(Boolean);

    return Response.json({ success: true, files });
  } catch (error) {
    console.error("Error getting file tree:", error);
    return Response.json({ success: true, files: [] });
  }
};

export const readFileContent = async (
  req: Request,
  params: Record<string, string>
): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json(
      { success: false, message: "User id not found" },
      { status: 403 }
    );
  }

  const projectId = params.projectId;
  const url = new URL(req.url);
  const filePath = url.searchParams.get("path");

  if (!projectId) {
    return Response.json(
      { success: false, message: "Project ID is required" },
      { status: 400 }
    );
  }

  if (!filePath) {
    return Response.json(
      { success: false, message: "File path is required" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return Response.json(
      { success: false, message: "Project not found" },
      { status: 404 }
    );
  }

  if (project.userId !== userId) {
    return Response.json(
      { success: false, message: "Access denied." },
      { status: 403 }
    );
  }

  try {
    const sandbox = await Sandbox.connect(project.sandboxId);
    await sandbox.setTimeout(env.sandboxTimeoutMs);

    const cleanPath = filePath.replace(/\\/g, "/").replace(/\.\.+/g, "");
    const targetPath = cleanPath.startsWith("/home/user/app/")
      ? cleanPath
      : `/home/user/app/${cleanPath.replace(/^\/+/, "")}`;

    const content = await sandbox.files.read(targetPath);

    return Response.json({ success: true, content });
  } catch (error) {
    console.error("Error reading file:", error);
    return Response.json(
      { success: false, message: "Failed to read file", content: "" },
      { status: 500 }
    );
  }
};
