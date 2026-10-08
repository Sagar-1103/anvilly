import type { Request, Response } from "express";
import { AsyncHandler, getClientChatMessages, getAgentState, getUserId } from "../utils/helper-functions";
import { answerQuestionSchema, createProjectSchema, updateProjectMetadataSchema, updateProjectSchema } from "../utils/project-schema";
import { sendValidationError } from "../utils/validation";
import { prisma } from "@repo/db/client";
import { env } from "../constants/env";
import Sandbox from "@e2b/code-interpreter";
import { agentLoop } from "../utils/agent-loop";
import { provider } from "../providers";
import { EventStream } from "../utils/event-stream";
import { getTitleAndDescriptionPrompt, parseTitleAndDescription } from "../utils/prompt";
import type { Message } from "../utils/types";
import { pendingQuestions } from "../utils/tools/qna";
import { ensureExpoRunning, initializeExpoSandbox } from "../utils/e2b/expo-sandbox";
import { captureProjectScreenshot } from "../utils/screenshot";
import { acquireAgentLock, releaseAgentLock, invalidateAgentState, invalidateChatCache, clearActiveSession } from "../utils/redis";

export const createProject = AsyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({success:false,message:"User id not found"});
    }
    
    const parsedBody = createProjectSchema.safeParse(req.body);

    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error);
        return;
    }

    const { userPrompt, template = "bun_react_shadcn" } = parsedBody.data;

    let title = "Untitled Project";
    let description = userPrompt.slice(0, 100).trim();

    try {
        const titleAndDescRaw = await provider.generateText({
            model: "deepseek-flash",
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
            lifecycle: { onTimeout: "pause", autoResume: true }
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
            lifecycle: { onTimeout: "pause", autoResume: true }
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

    return res.status(201).json({success:true,project,message:"Project created successfully"});
});


export const updateProject = AsyncHandler(async(req:Request,res:Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({success:false,message:"User id not found"});
    }

    const projectId = req.params.projectId as string;

    if (!projectId) {
        return res.status(401).json({ success: false, message: "Project Id is required" });
    }
    
    const parsedBody = updateProjectSchema.safeParse(req.body);

    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error);
        return;
    }

    const { userPrompt } = parsedBody.data;

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.userId !== userId) {
        return res.status(403).json({ success: false, message: "Access denied. You do not have permission to update this project." });
    }

    const hasLock = await acquireAgentLock(userId, projectId);
    if (!hasLock) {
        return res.status(409).json({
            success: false,
            message: "Another prompt execution is currently in progress for this project. Please wait.",
        });
    }

    try {
        const eventStream = new EventStream(req, res);
        eventStream.addHeaders();

        const sandbox = await Sandbox.connect(project.sandboxId);
        await sandbox.setTimeout(env.sandboxTimeoutMs);

        await agentLoop(eventStream, userId, projectId, sandbox, userPrompt, project.template);

        eventStream.end();
    } finally {
        await releaseAgentLock(userId, projectId);
    }
});

export const getProject = AsyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({ success: false, message: "User id not found" });
    }
    const projectId = req.params.projectId as string;

    if (!projectId) {
        return res.status(401).json({ success: false, message: "Project Id is required" });
    }

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.userId !== userId) {
        return res.status(403).json({ success: false, message: "Access denied. You do not have permission to view this project." });
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
            url = "http://" + sandbox.getHost(3000);
            if (!project.previewImage && url) {
                captureProjectScreenshot(projectId, url).catch(() => {});
            }
        }
    } catch (error) {
        console.error("Error connecting to sandbox in getProject:", error);
    }

    const hasDevServerStarted = (agentState?.workspace?.serverRunning) ?? clientMessages.some(
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

    return res.status(200).json({ success: true, data, message: "Project fetched successfully" });
});

export const getProjects = AsyncHandler(async(req:Request,res:Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({success:false,message:"User id not found"});
    }

    const projects = await prisma.project.findMany({
        where:{
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return res.status(200).json({success:true,projects,message:"Projects fetched successfully"});
});

export const answerQuestion = AsyncHandler(async(req:Request,res:Response) => {
    const parsedBody = answerQuestionSchema.safeParse(req.body);

    if (!parsedBody.success) {
        sendValidationError(res,parsedBody.error);
        return;
    }

    const { questionId, answer } = parsedBody.data;
    const pending = pendingQuestions.get(questionId);

    if (!pending) {
        return res.status(404).json({ success: false, message: "Question timed out or not found" });
    }

    const userId = getUserId(req);
    if (pending.userId && userId && pending.userId !== userId) {
        return res.status(403).json({ success: false, message: "Unauthorized to answer this question" });
    }

    pending.resolve(answer);

    return res.status(200).json({success:true,message:"Question answered successfully"});
});

export const pingProject = AsyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({success:false,message:"User id not found"});
    }
    const projectId = req.params.projectId as string;

    let project = await prisma.project.findUnique({
        where: {
            id: projectId,
        },
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project no found" });
    }

    if (userId !== project.userId) {
        return res.status(403).json({ success: false, message: "Project access not granted" });
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
            url = sandbox.getHost(3000);
        }
    } catch (error) {
        console.error("Sandbox connect failed, recreating:", (error as Error).message);
        const templateToUse = project.template || "bun_react_shadcn";
        const sandbox = await Sandbox.create({
            template: templateToUse,
            timeoutMs: env.sandboxTimeoutMs,
            lifecycle: { onTimeout: "pause", autoResume: false }
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
            url = sandbox.getHost(3000);
        }

        project = await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                sandboxId: sandbox.sandboxId,
                tunnelUrl: tunnelUrl || null,
            },
        });
    }


    return res.status(201).json({ success: true, project, url, expoUrl, tunnelUrl, message: "Ping success" });
});

export const deleteProject = AsyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({ success: false, message: "User id not found" });
    }
    const projectId = req.params.projectId as string;

    if (!projectId) {
        return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId,
        },
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
    }

    try {
        const sandbox = await Sandbox.connect(project.sandboxId);
        await sandbox.kill();
    } catch (e) {
        console.log("Could not kill sandbox or sandbox already inactive:", e);
    }

    await prisma.project.delete({
        where: {
            id: projectId,
        },
    });

    await Promise.allSettled([
        invalidateAgentState(userId, projectId),
        invalidateChatCache(userId, projectId),
        clearActiveSession(userId, projectId),
    ]);

    return res.status(200).json({ success: true, message: "Project deleted successfully" });
});

export const updateProjectMetadata = AsyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({ success: false, message: "User id not found" });
    }

    const projectId = req.params.projectId as string;
    if (!projectId) {
        return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const parsedBody = updateProjectMetadataSchema.safeParse(req.body);
    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error);
        return;
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            userId,
        },
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found or unauthorized" });
    }

    const { title, description } = parsedBody.data;

    const updatedProject = await prisma.project.update({
        where: {
            id: projectId,
        },
        data: {
            ...(title !== undefined ? { title } : {}),
            ...(description !== undefined ? { description } : {}),
        },
    });

    return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project: updatedProject,
    });
});