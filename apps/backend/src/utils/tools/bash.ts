import type Sandbox from "e2b";
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
            directory: {
                type: "string",
                description: "directory where the bash command will be executed"
            }
        },
        required: ["command","directory"]
    },
}


export const bashToolHandler = async (
  sandbox: Sandbox,
  eventStream: EventStream,
  args: {
    command: string;
  }
): Promise<{ stderr: string; stdout: string } | { error: string }> => {
  try {
    const response = await sandbox.commands.run(args.command);
    // send event stream
    eventStream.send("tool_call",response);
    return response;
  } catch (error) {
    return { error: (error as Error).message };
  }
};