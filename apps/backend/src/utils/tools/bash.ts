import type Sandbox from "@e2b/code-interpreter";
import type { EventStream } from "../event-stream";

export const bashTool:any = {
    type: "function",
    name: "bash_tool",
    description: "bash tool",
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
    const response = await sandbox.commands.run(command);
    eventStream.send("tool_call",response);
    return response;
  } catch (error) {
    return { error: (error as Error).message };
  }
}