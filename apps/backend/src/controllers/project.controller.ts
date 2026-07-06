import type { Request, Response } from "express";
import { AsyncHandler, getMessages, getUserId } from "../utils/helper-functions";
import { answerQuestionSchema, createProjectSchema, updateProjectSchema } from "../utils/project-schema";
import { sendValidationError } from "../utils/validation";
import { prisma } from "@repo/db/client";
import { env } from "../constants/env";
import Sandbox from "@e2b/code-interpreter";
import { agentLoop, llm } from "../utils/agent-loop";
import { EventStream } from "../utils/event-stream";
import { getTitleSystemPrompt } from "../utils/prompt";
import type { Message } from "../utils/types";

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

    const { userPrompt } = parsedBody.data;

    const interaction = await llm.interactions.create({
        model: "gemini-3.5-flash",
        input: getTitleSystemPrompt(userPrompt), 
    });

    const sandbox = await Sandbox.create({
        template: "bun-react-shadcn",
        timeoutMs: env.sandboxTimeoutMs,
        lifecycle: { onTimeout: "pause", autoResume: true }
    });

    const project = await prisma.project.create({
        data: {
            sandboxId: sandbox.sandboxId,
            prompt: userPrompt,
            title: interaction.output_text || "Untitled Project",
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

    const eventStream = new EventStream(req,res);
    eventStream.addHeaders();

    const { userPrompt } = parsedBody.data;

    const project = await prisma.project.findUnique({
        where:{
            id:projectId,
            userId,
        },
    });

    if (!project) {
        return res.status(404).json({success:false,message:"Project doesnt exist"});
    }

    const sandbox = await Sandbox.connect(project.sandboxId);

    await agentLoop(eventStream,userId,projectId,sandbox,userPrompt);

    eventStream.end();
});

export const getProject = AsyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({success:false,message:"User id not found"});
    }
    const projectId = req.params.projectId as string;

    if (!projectId) {
        return res.status(401).json({ success: false, message: "Project Id is required" });
    }

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
            userId,
        },
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    const messages: Message[] = await getMessages(userId,projectId);

    let url = "http://";
    try {
        const sandbox = await Sandbox.connect(project.sandboxId);
        url += sandbox.getHost(3000);
    } catch (error) {
        console.error("Error connecting to sandbox in getProject:", error);
    }

    const data = {
        title:project.title,
        url,
        userPrompt:project.prompt,
        messages
    }

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
    });

    return res.status(200).json({success:true,projects,message:"Projects fetched successfully"});
});

export const answerQuestion = AsyncHandler(async(req:Request,res:Response) => {
    const parsedBody = answerQuestionSchema.safeParse(req.body);

    if (!parsedBody.success) {
        sendValidationError(res,parsedBody.error);
        return;
    }

    const { type } = parsedBody.data;

    if (type==="option") {
        
    } else {

    }

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
    try {
        const sandbox = await Sandbox.connect(project.sandboxId);
        url = sandbox.getHost(3000);
    } catch (error) {
        const sandbox = await Sandbox.create({
            template: "bun-react-shadcn",
            timeoutMs: env.sandboxTimeoutMs,
            lifecycle: { onTimeout: "pause", autoResume: false }
        });

        project = await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                sandboxId: sandbox.sandboxId,
            },
        });
        url = sandbox.getHost(3000);
        // will have to put all the project files and code to the new sandbox
    }

    return res.status(201).json({ success: true, project, url, message: "Ping success" });
});