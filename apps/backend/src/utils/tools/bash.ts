import type Sandbox from "@e2b/code-interpreter";
import type { EventStream } from "../event-stream";
import { env } from "../../constants/env";

import type { ToolDefinition } from "../../providers/types";

export const bashTool: ToolDefinition = {
    type: "function",
    function: {
        name: "bash_tool",
        description: "Run a shell command for installing packages (e.g. bun add, bunx --bun shadcn@latest add for web projects; npx expo install, npm install for React Native Expo projects), listing files, or other utility commands. CRITICAL: Do NOT run build commands or dev server commands using this tool. You MUST use the build_project_tool to verify/compile, and run_project_tool to start/restart the server. Do NOT use this tool to create, read, update, or delete files (use the respective file tools).",
        parameters: {
            type: "object",
            properties: {
                command: {
                    type: "string",
                    description: "command that needs to run on the bash"
                },
            },
            required: ["command"]
        },
    },
};

export const bashToolHandler = async(sandbox: Sandbox, eventStream: EventStream, args: { command:string }) => {
  try {
    const { command } = args
    const response = await sandbox.commands.run(command, { cwd:"/home/user/app", timeoutMs:env.sandboxTimeoutMs });

    eventStream.send("tool_call",response);
    return response;
  } catch (error) {
    console.log(error);

    return { error: (error as Error).message };
  }
}