import type Sandbox from "@e2b/code-interpreter"
import type { EventStream } from "../event-stream";
import { env } from "../../constants/env";

import type { ToolDefinition } from "../../providers/types";

export const buildProjectTool: ToolDefinition = {
    type: "function",
    function: {
        name: "build_project_tool",
        description: "Build or verify the current project to ensure it compiles successfully. Run this after every set of file changes before restarting the dev server. Read the output carefully; if verification fails, fix the errors and run this tool again before proceeding.",
        parameters: {
            type: "object",
            properties: {},
            required: []
        },
    },
};

export const buildProjectToolHandler = async (sandbox: Sandbox, eventStream: EventStream, args?: {}) => {
    try {
        const isExpo = await sandbox.files.exists("/home/user/app/app.json");
        const buildCommand = isExpo ? "npx tsc --noEmit" : "bun run build";

        const response = await sandbox.commands.run(buildCommand, {
            cwd: "/home/user/app",
            timeoutMs: env.sandboxTimeoutMs,
        });

        eventStream.send("tool_call", response);
        return response;
    } catch (error) {
        console.log(error);
        
        return { error: (error as Error).message };
    }
}