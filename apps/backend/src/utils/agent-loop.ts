import { GoogleGenAI } from "@google/genai";
import { env } from "../constants/env";
import { systemPrompt } from "./prompt";
import type { Message, MessageType, Role, ToolCall } from "./types";
import { parseHistory } from "./helper-functions";
import type { EventStream } from "./event-stream";
import { toolHandlers, tools } from "./tools";
import type Sandbox from "@e2b/code-interpreter";
import { redisClient } from "..";
import { prisma } from "@repo/db/client";

export const llm = new GoogleGenAI({
    apiKey:env.geminiApiKey,
});

export const agentLoop = async (eventStream: EventStream, userId:string, projectId:string , sandbox: Sandbox, userPrompt: string) => {

    let previousId: any = undefined;
    let interaction: any = undefined;
    const key = `${userId}-${projectId}`

    const redisMessages = await redisClient.get(key);
    const messages: Message[] = redisMessages ? JSON.parse(redisMessages) : [];
    const messagesLength = messages.length;

    messages.push({ role: "USER",type:"TEXT",content: userPrompt });
    let currentPrompt = userPrompt;

    while (true) {
        const history = parseHistory(messages);
        interaction = await llm.interactions.create({
            model: "gemini-3.1-pro-preview",
            input: `
            Current prompt: ${currentPrompt}

            History:
            ${history}
            `,
            // @ts-ignore
            tools: tools,
            system_instruction: systemPrompt,
            previous_interaction_id: previousId,
        });

        if (interaction.output_text) {
            eventStream.send("text", interaction.output_text);
            messages.push({ role: "AI",type:"TEXT",content: interaction.output_text });
            redisClient.set(key, JSON.stringify(messages));
        }

        let calledTool = false;

        for (const step of interaction.steps) {
            if (step.type !== "function_call") continue;
            calledTool = true;
            const handler = (toolHandlers as any)[step.name];

            if (!handler) {
                messages.push({ role: "AI",type:"TEXT", content: `Tool ${step.name} not found` });
                redisClient.set(key, JSON.stringify(messages));
                continue;
            }
            const result = await handler(sandbox, eventStream, step.arguments);
            console.log(step.name, " | ", JSON.stringify(step.arguments), " | ", step);
            messages.push({ role: "AI",type:"TOOL_CALL", name: step.name, callId: step.id, arguments: step.arguments, result });
            redisClient.set(key, JSON.stringify(messages));
        }

        if (!calledTool) {
            break;
        }
        previousId = interaction.id;
    }
    const newMessages = messages.slice(messagesLength);
    const data = newMessages.map((message)=>{
        const value:{projectId:string,from:Role,type:MessageType,contents:string,toolCall?:ToolCall} = {
            projectId,
            from: message.role === "USER" ? "USER" : "AI",
            type: message.type,
            contents: JSON.stringify(message),
            toolCall: message.type==="TOOL_CALL" ? message.name as ToolCall : undefined,
        };
        return value;
    })
    // await prisma.history.createMany({
    //     data: [...data]
    // })

}