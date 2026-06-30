import type { Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { env } from "../constants/env";
import { systemPrompt } from "./prompt";
import type { Message } from "./types";
import { qnaTool, qnaToolHandler } from "./tools/qna";
import { bashTool, bashToolHandler } from "./tools/bash";
import { parseHistory } from "./helper-functions";
import type { EventStream } from "./event-stream";
import fs from "fs";
import type Sandbox from "e2b";

export const llm = new GoogleGenAI({
    apiKey:env.geminiApiKey,
});

const tools = [qnaTool,bashTool];

const toolHandlers = {
    "qna_tool": qnaToolHandler,
    "bash_tool": bashToolHandler
}

export const agentLoop = async(res: Response,eventStream:EventStream,sandbox:Sandbox,userPrompt: string,) => {

    let previousId: any = undefined;
    let interaction: any = undefined;

    const messages:Message[] = []; 

    messages.push({role:"USER",content: userPrompt});
    let currentPrompt = userPrompt;

    while (true) {
        const history = parseHistory(messages);
        interaction = await llm.interactions.create({
            model: "gemini-2.5-pro",
            input: `
            Current prompt: ${currentPrompt}

            History:
            ${history}
            `,
            // @ts-ignore
            tools,
            system_instruction: systemPrompt,
            previous_interaction_id:previousId,
        });

        if (interaction.output_text) {
            eventStream.send("text",interaction.output_text);
            messages.push({role:"AI",content:interaction.output_text});
        }

        let calledTool = false;

        for(const step of interaction.steps) {
            if (step.type !== "function_call") continue;
            calledTool = true;
            const handler = (toolHandlers as any)[step.name];

            if (!handler) {
                messages.push({role: "TOOL_CALL",content: `Tool ${step.name} not found`});
                continue;
            }

            const result = await handler(sandbox,eventStream,step.arguments);
            console.log(step.name," | ",JSON.stringify(step.arguments));
            messages.push({role:"TOOL_CALL",name:step.name,callId: step.id,arguments:step.arguments,result});
        }

        if (!calledTool) {
            break;
        }
        previousId = interaction.id;
    }
    fs.writeFileSync("./memory.json",JSON.stringify(messages,null,2));
    eventStream.autoEnd();
}