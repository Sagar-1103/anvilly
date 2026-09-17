import type Sandbox from "@e2b/code-interpreter"
import type { EventStream } from "../event-stream";

import type { ToolDefinition } from "../../providers/types";

export const readFileTool: ToolDefinition = {
    type: "function",
    function: {
        name: "read_file_tool",
        description: "Read the contents of a file inside the project. Use this tool whenever you need to inspect existing code, configuration, or project files before making changes. Do not use this tool to execute commands or modify files.",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The relative path of the file to read."
                },
            },
            required: ["location"]
        },
    },
};

export const readFileToolHandler = async(sandbox:Sandbox, eventStream: EventStream, args:{ location: string }) => {
    try {
        const { location } = args;
        const targetLocation = location.startsWith("/") ? location : `/home/user/app/${location}`;
        const response = await sandbox.files.read(targetLocation);
        return response;
    } catch (error) {
        console.error(error);
        return { error: (error as Error).message };
    }
}