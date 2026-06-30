import type Sandbox from "@e2b/code-interpreter"
import type { EventStream } from "../event-stream";

export const runProjectTool:any = {
    type: "function",
    name: "run_project_tool",
    description: "Start the project's development server and make the application available in the live preview. If the development server is already running, restart it so the latest changes are reflected. Use this tool after a successful build or whenever the application needs to be launched or refreshed for preview. Do not use this tool before the required project files have been created or updated.", 
    parameters: {
        type: "object",
        properties:{},
        required: []
    },
}

export const runProjectToolHandler = async(sandbox:Sandbox, eventStream: EventStream, args:{ }) => {
    const status = await sandbox.commands.run("bunx pm2 describe app");
    let response;
    if (status.exitCode===0) {
        response = await sandbox.commands.run("bunx pm2 restart app");
    } else {
        response = await sandbox.commands.run(`bunx pm2 start "bun run start" --name app --interpreter none`);
    }
    eventStream.send("tool_call",response);

    return response;
}