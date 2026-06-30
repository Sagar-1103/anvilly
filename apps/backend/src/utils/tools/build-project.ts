import type Sandbox from "@e2b/code-interpreter"
import type { EventStream } from "../event-stream";

export const buildProjectTool: any = {
    type: "function",
    name: "build_project_tool",
    description: "Build the current project to verify it compiles successfully. Run this after every set of file changes before restarting the dev server. Read the output carefully, if the build fails, fix the errors and run this tool again before proceeding.",
    parameters: {
        type: "object",
        properties: {},
        required: []
    },
}

export const buildProjectToolHandler = async (sandbox: Sandbox, eventStream: EventStream, args?: {}) => {
    try {
        const response = await sandbox.commands.run("bun run build", {
            cwd: "/home/user/app",
            timeoutMs: 30000,
        });

        eventStream.send("tool_call", response);
        return response;
    } catch (error) {
        console.log(error);
        
        return { error: (error as Error).message };
    }
}