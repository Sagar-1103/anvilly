import type Sandbox from "@e2b/code-interpreter"
import type { EventStream } from "../event-stream";

export const createFileTool:any = {
    type: "function",
    name: "create_file_tool",
    description: "Create a new file in the project with the provided contents. Use this tool when adding a file that does not already exist, such as source code, configuration files, documentation, or assets. Do not use this tool to modify existing files.",
    parameters: {
        type: "object",
        properties:{
            location: {
                type: "string",
                description:"The relative path where the new file should be created."
            },
            content: {
                type: "string",
                description: "The complete UTF-8 text content of the file. Include all imports, code, comments and formatting exactly as the file should appear after creation."
            }
        },
        required: ["location","content"]
    },
}

export const createFileToolHandler = async(sandbox:Sandbox, eventStream: EventStream, args:{ location: string,content:string }) => {
    const { location, content } = args;
    const targetLocation = location.startsWith("/") ? location : `/home/user/app/${location}`;
    const response = await sandbox.files.write(targetLocation,content);
    return response;
}