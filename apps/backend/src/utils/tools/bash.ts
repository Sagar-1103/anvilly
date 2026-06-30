import type Sandbox from "@e2b/code-interpreter";
import type { EventStream } from "../event-stream";

export const bashTool:any = {
    type: "function",
    name: "bash_tool",
    description: "Run a shell command for installing packages (e.g. bun add, bunx --bun shadcn@latest add), listing files, or other utility commands. Do NOT use this tool to: build the project (use build_project_tool), start or restart the dev server (use run_project_tool), create or write files (use create_file_tool), read file contents (use read_file_tool), update file contents (use update_file_tool), or delete files (use delete_file_tool).",
    parameters: {
        type: "object",
        properties:{
            command: {
                type: "string",
                description:"command that needs to run on the bash"
            },
        },
        required: ["command"]
    },
}

export const bashToolHandler = async(sandbox: Sandbox, eventStream: EventStream, args: { command:string }) => {
  try {
    const { command } = args
    const response = await sandbox.commands.run(command, { cwd:"/home/user/app" });

    eventStream.send("tool_call",response);
    return response;
  } catch (error) {
    console.log(error);

    return { error: (error as Error).message };
  }
}