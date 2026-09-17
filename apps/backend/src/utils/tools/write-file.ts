import type Sandbox from "@e2b/code-interpreter";
import type { EventStream } from "../event-stream";
import type { ToolDefinition } from "../../providers/types";

export const writeFileTool: ToolDefinition = {
    type: "function",
    function: {
        name: "write_file_tool",
        description: "Write content to a file in the project. Use this tool to create new files or completely update/overwrite existing files with the provided contents. Always provide the complete file content.",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The relative path where the file should be created or updated (e.g. 'src/components/Navbar.tsx')."
                },
                content: {
                    type: "string",
                    description: "The complete UTF-8 text content of the file. Include all imports, code, comments, and formatting exactly as the file should appear."
                }
            },
            required: ["location", "content"]
        }
    }
};

export const writeFileToolHandler = async (
    sandbox: Sandbox,
    eventStream: EventStream,
    args: { location: string; content: string }
) => {
    try {
        const { location, content } = args;
        const targetLocation = location.startsWith("/") ? location : `/home/user/app/${location}`;
        const response = await sandbox.files.write(targetLocation, content);
        return response;
    } catch (error) {
        console.error(error);
        return { error: (error as Error).message };
    }
};
