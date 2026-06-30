import type { Request, Response } from "express";
import { AsyncHandler } from "../utils/helper-functions";
import { createProjectSchema } from "../utils/project-schema";
import { sendValidationError } from "../utils/validation";
import { prisma } from "@repo/db/client";
import { env } from "../constants/env";
import { EventStream } from "../utils/event-stream";
import { agentLoop } from "../utils/agent-loop";
import Sandbox from "@e2b/code-interpreter";

export const createProject = AsyncHandler(async (req: Request, res: Response) => {
    // const userId = getUserId(req,res);
    const eventStream = new EventStream(req, res);

    eventStream.addHeaders();
    const userId = "d9df9041-9938-4992-b42b-942b437b014d";

    const parsedBody = createProjectSchema.safeParse(req.body);

    if (!parsedBody.success) {
        sendValidationError(res, parsedBody.error);
        return;
    }

    const { userPrompt } = parsedBody.data;

    const sandbox = await Sandbox.create({
        template: "bun-react-shadcn",
        timeoutMs: env.sandboxTimeoutMs,
        lifecycle: { onTimeout: "pause", autoResume: false }
    });

    const project = await prisma.project.create({
        data: {
            sandboxId: sandbox.sandboxId,
            userId,
        },
    });

    const url = sandbox.getHost(3000);
    eventStream.send("text", url);

    eventStream.send("project", project);

    await agentLoop(res, eventStream, sandbox, userPrompt);

    eventStream.end();

    // return res.status(201).json({success:true,project,message:"Project created successfully"});
});

export const getProject = AsyncHandler(async (req: Request, res: Response) => {
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

    let url = "";
    try {
        const sandbox = await Sandbox.connect(project.sandboxId);
        url = sandbox.getHost(3000);
    } catch (error) {
        console.error("Error connecting to sandbox in getProject:", error);
    }

    return res.status(200).json({ success: true, project, url, message: "Project fetched successfully" });
});

export const pingProject = AsyncHandler(async (req: Request, res: Response) => {
    const userId = "d9df9041-9938-4992-b42b-942b437b014d";
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