import { GoogleGenAI } from "@google/genai";
import { env } from "../constants/env";
import { systemPrompt } from "./prompt";
import type { Message, MessageType, Role, ToolCall } from "./types";
import { getMessages, parseHistory } from "./helper-functions";
import type { EventStream } from "./event-stream";
import { toolHandlers, tools } from "./tools";
import type Sandbox from "@e2b/code-interpreter";
import { prisma } from "@repo/db/client";
import { storeInRedis } from "./redis";

export const llm = new GoogleGenAI({
    apiKey:env.geminiApiKey,
});

export const agentLoop = async (eventStream: EventStream, userId:string, projectId:string , sandbox: Sandbox, userPrompt: string) => {

    let previousId: any = undefined;
    let interaction: any = undefined;
    const key = `${userId}-${projectId}`

    const messages: Message[] = await getMessages(userId,projectId);
    
    const messagesLength = messages.length;

    messages.push({ role: "USER",type:"TEXT",content: userPrompt });
    let currentPrompt = userPrompt;

    while (true) {
        const history = parseHistory(messages);
        interaction = await llm.interactions.create({
            model: "gemini-3.5-flash",
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
        let calledQna = false;

        for (const step of interaction.steps) {
            if (step.type !== "function_call") continue;
            calledTool = true;
            const handler = (toolHandlers as any)[step.name];

            if (!handler) {
                messages.push({ role: "AI",type:"TEXT", content: `Tool ${step.name} not found` });
                await storeInRedis(key,messages)
                continue;
            }
            eventStream.send("tool_call", { name: step.name, arguments: step.arguments });
            const result = await handler(sandbox, eventStream, step.arguments);
            console.log(step.name, " | ", JSON.stringify(step.arguments), " | ", step);
            messages.push({ role: "AI",type:"TOOL_CALL", name: step.name, callId: step.id, arguments: step.arguments, result });
            await storeInRedis(key,messages)

            if (step.name === "qna_tool") {
                calledQna = true;
                break;
            }
        }

        if (!calledTool) {
            break;
        }

        if (calledQna) {
            currentPrompt = "The user has answered your clarification question (see history). Now proceed with building the project.";
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