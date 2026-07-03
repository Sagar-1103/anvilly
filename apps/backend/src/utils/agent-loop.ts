import { GoogleGenAI } from "@google/genai";
import { env } from "../constants/env";
import { systemPrompt } from "./prompt";
import type { AiToolCallMessage, Message, MessageType, Role, ToolCall } from "./types";
import { parseHistory } from "./helper-functions";
import type { EventStream } from "./event-stream";
import { toolHandlers, tools } from "./tools";
import type Sandbox from "@e2b/code-interpreter";
import { prisma } from "@repo/db/client";
import { redisClient, storeInRedis } from "./redis";

export const llm = new GoogleGenAI({
    apiKey:env.geminiApiKey,
});

export const agentLoop = async (eventStream: EventStream, userId:string, projectId:string , sandbox: Sandbox, userPrompt: string) => {

    let previousId: any = undefined;
    let interaction: any = undefined;
    const key = `${userId}-${projectId}`

    let messages:Message[] = []

    const redisMessages = await redisClient.get(key);

    if (!redisMessages) {
        const dbMessages = await prisma.history.findMany({
            where:{
                projectId,
                project:{
                    userId,
                }
            },
        });
        messages = dbMessages.map((msg)=>{
            if (msg.type==="TOOL_CALL" && msg.toolCall) {
                const {arguments:v,callId,result,content} = JSON.parse(msg.content);
                return {
                    role:"AI",
                    type:"TOOL_CALL",
                    name:msg.toolCall.toLowerCase(),
                    content,
                    arguments:v,
                    callId,
                    result,
                };
            } else {
                return {
                    role:msg.role==="AI"?"AI":"USER",
                    type:"TEXT",
                    content: msg.content,
                }
            }
        });
        await storeInRedis(key,messages);

    } else {
        messages = redisMessages ? JSON.parse(redisMessages) : [];
    }

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
            await storeInRedis(key,messages)
        }

        let calledTool = false;

        for (const step of interaction.steps) {
            if (step.type !== "function_call") continue;
            calledTool = true;
            const handler = (toolHandlers as any)[step.name];

            if (!handler) {
                messages.push({ role: "AI",type:"TEXT", content: `Tool ${step.name} not found` });
                await storeInRedis(key,messages)
                continue;
            }
            const result = await handler(sandbox, eventStream, step.arguments);
            console.log(step.name, " | ", JSON.stringify(step.arguments), " | ", step);
            messages.push({ role: "AI",type:"TOOL_CALL", name: step.name, callId: step.id, arguments: step.arguments, result });
            await storeInRedis(key,messages)
        }

        if (!calledTool) {
            break;
        }
        previousId = interaction.id;
    }
    const newMessages = messages.slice(messagesLength);
    const data = newMessages.map((message)=>{

        const value:{projectId:string,role:Role,type:MessageType,content:string,toolCall?:ToolCall} = {
            projectId,
            role: message.role,
            type: message.type,
            content: message.type==="TEXT" ? (message.content||""):JSON.stringify({arguments:message.arguments,callId:message.callId,result:message.result,content:message.content,}),
            toolCall: message.type==="TOOL_CALL" ? message.name.toUpperCase() as ToolCall : undefined,
        };
        return value;
    })
    await prisma.history.createMany({
        data: [...data]
    });
}