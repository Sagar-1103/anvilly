import type Sandbox from "@e2b/code-interpreter"
import type { EventStream } from "../event-stream";

import type { ToolDefinition } from "../../providers/types";

export const runProjectTool: ToolDefinition = {
    type: "function",
    function: {
        name: "run_project_tool",
        description: "Start the project's development server and make the application available in the live preview. If the development server is already running, restart it so the latest changes are reflected. Use this tool after a successful build or whenever the application needs to be launched or refreshed for preview. Do not use this tool before the required project files have been created or updated.", 
        parameters: {
            type: "object",
            properties: {},
            required: []
        },
    },
};

export const runProjectToolHandler = async(sandbox:Sandbox, eventStream: EventStream, args:{ }) => {
    try {
        const isExpo = await sandbox.files.exists("/home/user/app/app.json");
        let response;

        if (isExpo) {
            const check = await sandbox.commands.run("pgrep -f 'expo start' || true");
            if (!check.stdout.trim()) {
                response = await sandbox.commands.run(
                    "npx expo start --port 443 > /home/user/app/.expo.log 2>&1 &",
                    { cwd: "/home/user/app", background: true }
                );
            } else {
                response = { stdout: "Metro bundler active with Fast Refresh enabled", stderr: "", exitCode: 0 };
            }
        } else {
            const status = await sandbox.commands.run("bunx pm2 describe app");
            if (status.exitCode===0) {
                response = await sandbox.commands.run("bunx pm2 restart app");
            } else {
                response = await sandbox.commands.run(`bunx pm2 start "bun run start" --name app --interpreter none`);
            }
        }
        eventStream.send("restart_project",response);

        return response;
    } catch (error) {
        console.log(error);
        return { error: (error as Error).message };
    }
}