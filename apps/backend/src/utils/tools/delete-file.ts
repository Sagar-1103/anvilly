import type Sandbox from "@e2b/code-interpreter"
import type { EventStream } from "../event-stream";

export const deleteFileTool:any = {
    type: "function",
    name: "delete_file_tool",
    description: "Delete a file from the project. Use this tool only when a file is no longer needed, is being replaced, or the user has explicitly requested its removal. Do not use this tool to clear file contents or modify existing files.",
    parameters: {
        type: "object",
        properties:{
            location: {
                type: "string",
                description:"The relative path of the file to delete."
            },
        },
        required: ["location"]
    },
}

export const deleteFileToolHandler = async(sandbox:Sandbox, eventStream: EventStream, args:{ location: string }) => {
    const { location } = args;
    const response = await sandbox.files.remove(args.location);
    return response;
}