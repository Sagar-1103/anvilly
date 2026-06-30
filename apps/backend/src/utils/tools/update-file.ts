import type Sandbox from "@e2b/code-interpreter"
import type { EventStream } from "../event-stream";

export const udpateFileTool:any = {
    type: "function",
    name: "update_file_tool",
    description: "Update an existing file in the project by replacing its contents with the provided text. Use this tool only for files that already exist. Read the file first if its current contents are unknown. Do not use this tool to create new files.",
    parameters: {
        type: "object",
        properties:{
            location: {
                type: "string",
                description:"The relative path of the existing file to update."
            },
            content: {
                type: "string",
                description: "The complete updated contents of the file. Always provide the entire file, preserving unchanged code unless intentionally modifying it. Do not provide diffs or partial snippets."
            }
        },
        required: ["location","content"]
    },
}

export const updateFileToolHandler = async(sandbox:Sandbox, eventStream: EventStream, args:{ location: string,content:string }) => {
    const { location, content } = args;
    const targetLocation = location.startsWith("/") ? location : `/home/user/app/${location}`;
    const response = await sandbox.files.write(targetLocation,content);
    return response;
}