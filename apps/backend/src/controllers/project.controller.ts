import { getClientChatMessages, getAgentState, getUserId } from "../utils/helper-functions";
import {
  answerQuestionSchema,
  createProjectSchema,
  updateProjectMetadataSchema,
  updateProjectSchema,
} from "../utils/project-schema";
import { sendValidationError } from "../utils/validation";
import { prisma } from "@repo/db";
import { env } from "../constants/env";
import Sandbox from "@e2b/code-interpreter";
import { agentLoop } from "../utils/agent-loop";
import { getProviderForUser, type LLMProvider } from "../providers";
import { EventStream } from "../utils/event-stream";
import { getTitleAndDescriptionPrompt, parseTitleAndDescription } from "../utils/prompt";
import { pendingQuestions } from "../utils/tools/qna";
import { ensureExpoRunning, initializeExpoSandbox } from "../utils/e2b/expo-sandbox";
import { captureProjectScreenshot } from "../utils/screenshot";
import {
  acquireAgentLock,
  releaseAgentLock,
  invalidateAgentState,
  invalidateChatCache,
  clearActiveSession,
} from "../utils/redis";
import { classifyLLMError } from "../utils/llm-error-handler";

export const createProject = async (req: Request): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json({ success: false, message: "User id not found" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = createProjectSchema.safeParse(body);
  if (!parsedBody.success) {
    return sendValidationError(parsedBody.error);
  }

  const {
    userPrompt,
    template = "bun_react_shadcn",
    provider: preferredProvider,
    credentialId,
    model,
  } = parsedBody.data;

  let title = "Untitled Project";
  let description = userPrompt.slice(0, 100).trim();

  let activeProvider: LLMProvider;
  let activeModel = "deepseek-chat";
  try {
    const userProviderResult = await getProviderForUser(userId, {
      credentialId,
      provider: preferredProvider,
      model,
    });
    activeProvider = userProviderResult.provider;
    activeModel = userProviderResult.defaultModel;
  } catch (e: any) {
    return Response.json(
      { success: false, message: e.message || "Please configure your API key in Account Settings." },
      { status: 400 }
    );
  }

  try {
    const titleAndDescRaw = await activeProvider.generateText({
      model: activeModel,
      prompt: getTitleAndDescriptionPrompt(userPrompt),
    });
    const parsed = parseTitleAndDescription(titleAndDescRaw, userPrompt);
    title = parsed.title;
    description = parsed.description;
  } catch (e) {
    console.error("Error generating title and description:", e);
  }

  let sandboxId = "";
  let tunnelUrl: string | undefined = undefined;

  if (template === "node_react_native_expo") {
    const sandbox = await Sandbox.create({
      template: "node-react-native-expo",
      timeoutMs: env.sandboxTimeoutMs,
      lifecycle: { onTimeout: "pause", autoResume: true },
    });
    sandboxId = sandbox.sandboxId;

    try {
      const expoDetails = await initializeExpoSandbox(sandbox);
      tunnelUrl = expoDetails.tunnelUrl;
    } catch (e) {
      console.error("Error initializing Expo tunnel/metro:", e);
    }
  } else {
    const sandbox = await Sandbox.create({
      template: "bun-react-shadcn",
      timeoutMs: env.sandboxTimeoutMs,
      lifecycle: { onTimeout: "pause", autoResume: true },
    });
    sandboxId = sandbox.sandboxId;
  }

  const project = await prisma.project.create({
    data: {
      sandboxId,
      prompt: userPrompt,
      title,
      description,
      template,
      tunnelUrl,
      userId,
    },
  });

  return Response.json(
    { success: true, project, message: "Project created successfully" },
    { status: 201 }
  );
};

export const updateProject = async (
  req: Request,
  params: Record<string, string>
): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json({ success: false, message: "User id not found" }, { status: 403 });
  }

  const projectId = params.projectId;
  if (!projectId) {
    return Response.json({ success: false, message: "Project Id is required" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = updateProjectSchema.safeParse(body);
  if (!parsedBody.success) {
    return sendValidationError(parsedBody.error);
  }

  const { userPrompt, provider: preferredProvider, credentialId, model } = parsedBody.data;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return Response.json({ success: false, message: "Project not found" }, { status: 404 });
  }

  if (project.userId !== userId) {
    return Response.json(
      { success: false, message: "Access denied. You do not have permission to update this project." },
      { status: 403 }
    );
  }

  let userProviderResult;
  try {
    userProviderResult = await getProviderForUser(userId, {
      credentialId,
      provider: preferredProvider,
      model,
    });
  } catch (e: any) {
    return Response.json(
      { success: false, message: e.message || "Please configure your API key in Account Settings." },
      { status: 400 }
    );
  }

  const hasLock = await acquireAgentLock(userId, projectId);
  if (!hasLock) {
    return Response.json(
      {
        success: false,
        message: "Another prompt execution is currently in progress for this project. Please wait.",
      },
      { status: 409 }
    );
  }

  const eventStream = new EventStream(req);

  (async () => {
    try {
      const sandbox = await Sandbox.connect(project.sandboxId);
      await sandbox.setTimeout(env.sandboxTimeoutMs);

      await agentLoop(
        eventStream,
        userId,
        projectId,
        sandbox,
        userPrompt,
        project.template,
        userProviderResult.provider,
        userProviderResult.defaultModel
      );
    } catch (err: any) {
      console.error("Unhandled error in prompt execution:", err);
      const classified = classifyLLMError(err, userProviderResult.providerName);
      eventStream.send("error", classified);
      eventStream.send("text", classified.markdownMessage);
      eventStream.send("done", {});
    } finally {
      eventStream.end();
      await releaseAgentLock(userId, projectId);
    }
  })();

  return eventStream.response;
};

export const getProject = async (
  req: Request,
  params: Record<string, string>
): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json({ success: false, message: "User id not found" }, { status: 403 });
  }
  const projectId = params.projectId;

  if (!projectId) {
    return Response.json({ success: false, message: "Project Id is required" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return Response.json({ success: false, message: "Project not found" }, { status: 404 });
  }

  if (project.userId !== userId) {
    return Response.json(
      { success: false, message: "Access denied. You do not have permission to view this project." },
      { status: 403 }
    );
  }

  const [clientMessages, agentState] = await Promise.all([
    getClientChatMessages(userId, projectId),
    getAgentState(userId, projectId),
  ]);

  let url = "";
  let expoUrl = "";
  let tunnelUrl = project.tunnelUrl || "";

  try {
    const sandbox = await Sandbox.connect(project.sandboxId);
    await sandbox.setTimeout(env.sandboxTimeoutMs);

    if (project.template === "node_react_native_expo") {
      const expoDetails = await ensureExpoRunning(sandbox, project.tunnelUrl);
      tunnelUrl = expoDetails.tunnelUrl;
      expoUrl = expoDetails.expoUrl;
      url = expoDetails.tunnelUrl;

      if (tunnelUrl !== project.tunnelUrl) {
        await prisma.project.update({
          where: { id: projectId },
          data: { tunnelUrl },
        });
      }
    } else {
      url = "https://" + sandbox.getHost(3000);
      if (!project.previewImage && url) {
        captureProjectScreenshot(projectId, url).catch(() => {});
      }
    }
  } catch (error) {
    console.error("Error connecting to sandbox in getProject:", error);
  }

  const hasDevServerStarted =
    agentState?.workspace?.serverRunning ??
    clientMessages.some(
      (m) =>
        m.type === "TOOL_CALL" &&
        (m.name === "run_project_tool" || (m as any).toolCall === "RUN_PROJECT_TOOL")
    );

  const data = {
    title: project.title,
    description: project.description,
    url,
    expoUrl,
    tunnelUrl,
    template: project.template,
    userPrompt: project.prompt,
    previewImage: project.previewImage,
    messages: clientMessages,
    hasDevServerStarted,
  };

  return Response.json(
    { success: true, data, message: "Project fetched successfully" },
    { status: 200 }
  );
};

export const getProjects = async (req: Request): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json({ success: false, message: "User id not found" }, { status: 403 });
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(
    { success: true, projects, message: "Projects fetched successfully" },
    { status: 200 }
  );
};

export const answerQuestion = async (req: Request): Promise<Response> => {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = answerQuestionSchema.safeParse(body);
  if (!parsedBody.success) {
    return sendValidationError(parsedBody.error);
  }

  const { questionId, answer } = parsedBody.data;
  const pending = pendingQuestions.get(questionId);

  if (!pending) {
    return Response.json(
      { success: false, message: "Question timed out or not found" },
      { status: 404 }
    );
  }

  const userId = getUserId(req);
  if (pending.userId && userId && pending.userId !== userId) {
    return Response.json(
      { success: false, message: "Unauthorized to answer this question" },
      { status: 403 }
    );
  }

  pending.resolve(answer);

  return Response.json(
    { success: true, message: "Question answered successfully" },
    { status: 200 }
  );
};

export const pingProject = async (
  req: Request,
  params: Record<string, string>
): Promise<Response> => {
  const userId = getUserId(req);
  if (!userId) {
    return Response.json({ success: false, message: "User id not found" }, { status: 403 });
  }
  const projectId = params.projectId;

  let project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return Response.json({ success: false, message: "Project not found" }, { status: 404 });
  }

  if (userId !== project.userId) {
    return Response.json(
      { success: false, message: "Project access not granted" },
      { status: 403 }
    );
  }

  let url = "";
  let expoUrl = "";
  let tunnelUrl = project.tunnelUrl || "";

  try {
    const sandbox = await Sandbox.connect(project.sandboxId);
    if (project.template === "node_react_native_expo") {
      try {
        const expoDetails = await ensureExpoRunning(sandbox, project.tunnelUrl);
        tunnelUrl = expoDetails.tunnelUrl;
        expoUrl = expoDetails.expoUrl;
        url = expoDetails.tunnelUrl;
      } catch (expoError) {
        console.error("Expo services failed to start on existing sandbox:", expoError);
      }
    } else {
      url = "https://" + sandbox.getHost(3000);
    }
  } catch (error) {
    console.error("Sandbox connect failed, recreating:", (error as Error).message);
    const templateToUse = project.template || "bun_react_shadcn";
    const sandbox = await Sandbox.create({
      template: templateToUse,
      timeoutMs: env.sandboxTimeoutMs,
      lifecycle: { onTimeout: "pause", autoResume: false },
    });

    if (templateToUse === "node_react_native_expo") {
      try {
        const expoDetails = await initializeExpoSandbox(sandbox);
        tunnelUrl = expoDetails.tunnelUrl;
        expoUrl = expoDetails.expoUrl;
        url = expoDetails.tunnelUrl;
      } catch (expoError) {
        console.error("Expo init failed on new sandbox:", expoError);
      }
    } else {
      url = "https://" + sandbox.getHost(3000);
    }

    project = await prisma.project.update({
      where: { id: projectId },
      data: {
        sandboxId: sandbox.sandboxId,
        tunnelUrl: tunnelUrl || null,
      },
    });
  }

  return Response.json(
    { success: true, project, url, expoUrl, tunnelUrl, message: "Ping success" },
    { status: 201 }
  );
};

export const deleteProject = async (
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
    return Response.json(
      { success: false, message: "Project not found or unauthorized" },
      { status: 404 }
    );
  }

  try {
    const sandbox = await Sandbox.connect(project.sandboxId);
    await sandbox.kill();
  } catch (e) {
    console.log("Could not kill sandbox or sandbox already inactive:", e);
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  await Promise.allSettled([
    invalidateAgentState(userId, projectId),
    invalidateChatCache(userId, projectId),
    clearActiveSession(userId, projectId),
  ]);

  return Response.json(
    { success: true, message: "Project deleted successfully" },
    { status: 200 }
  );
};

export const updateProjectMetadata = async (
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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = updateProjectMetadataSchema.safeParse(body);
  if (!parsedBody.success) {
    return sendValidationError(parsedBody.error);
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });

  if (!project) {
    return Response.json(
      { success: false, message: "Project not found or unauthorized" },
      { status: 404 }
    );
  }

  const { title, description } = parsedBody.data;

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
    },
  });

  return Response.json(
    {
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    },
    { status: 200 }
  );
};