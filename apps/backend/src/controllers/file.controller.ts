import type { Request, Response } from "express";
import { AsyncHandler, getUserId } from "../utils/helper-functions";
import { prisma } from "@repo/db/client";
import { env } from "../constants/env";
import Sandbox from "@e2b/code-interpreter";

export const getFileTree = AsyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({ success: false, message: "User id not found" });
    }

    const projectId = req.params.projectId as string;
    if (!projectId) {
        return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.userId !== userId) {
        return res.status(403).json({ success: false, message: "Access denied." });
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

        return res.status(200).json({ success: true, files });
    } catch (error) {
        console.error("Error getting file tree:", error);
        return res.status(200).json({ success: true, files: [] });
    }
});

export const readFileContent = AsyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    if (!userId) {
        return res.status(403).json({ success: false, message: "User id not found" });
    }

    const projectId = req.params.projectId as string;
    const filePath = req.query.path as string;

    if (!projectId) {
        return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    if (!filePath) {
        return res.status(400).json({ success: false, message: "File path is required" });
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.userId !== userId) {
        return res.status(403).json({ success: false, message: "Access denied." });
    }

    try {
        const sandbox = await Sandbox.connect(project.sandboxId);
        await sandbox.setTimeout(env.sandboxTimeoutMs);

        const cleanPath = filePath.replace(/\\/g, "/").replace(/\.\.+/g, "");
        const targetPath = cleanPath.startsWith("/home/user/app/")
            ? cleanPath
            : `/home/user/app/${cleanPath.replace(/^\/+/, "")}`;

        const content = await sandbox.files.read(targetPath);

        return res.status(200).json({ success: true, content });
    } catch (error) {
        console.error("Error reading file:", error);
        return res.status(500).json({ success: false, message: "Failed to read file", content: "" });
    }
});
