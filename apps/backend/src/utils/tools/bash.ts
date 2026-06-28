import { exec } from "child_process";
import { promisify } from "util";

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


export const bashToolHandler = async (args: {
  command: string;
}): Promise<{ stderr: string; stdout: string } | { error: string }> => {
  try {
    let res = await promisify(exec)(args.command);
    return res;
  } catch (error) {
    return { error: (error as Error).message };
  }
};