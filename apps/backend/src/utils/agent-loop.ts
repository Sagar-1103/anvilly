import { provider } from "../providers";
import type { ChatMessage } from "../providers/types";
import { getSystemPrompt } from "./prompt";
import type { Message, MessageType, Role, ToolCall } from "./types";
import { getMessages, messagesToChatMessages } from "./helper-functions";
import type { EventStream } from "./event-stream";
import { toolHandlers, tools } from "./tools";
import type Sandbox from "@e2b/code-interpreter";
import { prisma } from "@repo/db/client";
import { storeInRedis } from "./redis";
import { captureProjectScreenshot } from "./screenshot";

const DEEPSEEK_MODEL = "deepseek-flash";

export const agentLoop = async (eventStream: EventStream, userId:string, projectId:string , sandbox: Sandbox, userPrompt: string, template?: string) => {

    const key = `${userId}-${projectId}`

    const messages: Message[] = await getMessages(userId,projectId);
    
    const messagesLength = messages.length;

    messages.push({ role: "USER",type:"TEXT",content: userPrompt });
    await storeInRedis(key, messages);

    while (true) {
        // Convert internal messages to OpenAI-compatible ChatMessage format
        const chatMessages: ChatMessage[] = messagesToChatMessages(messages);

        const response = await provider.chat({
            model: DEEPSEEK_MODEL,
            systemPrompt: getSystemPrompt(template),
            messages: chatMessages,
            tools: tools,
        });

        if (response.text) {
            eventStream.send("text", response.text);
            messages.push({ role: "AI",type:"TEXT",content: response.text, reasoning_content: response.reasoning_content });
            await storeInRedis(key,messages)
        }

        let calledTool = false;

        const qnaCalls = response.toolCalls.filter((t) => t.name === "qna_tool");
        const otherCalls = response.toolCalls.filter((t) => t.name !== "qna_tool");

        if (qnaCalls.length > 0) {
            calledTool = true;
            const qnaResults = await Promise.all(
                qnaCalls.map(async (toolCall) => {
                    eventStream.send("tool_call", { name: toolCall.name, arguments: toolCall.arguments });
                    const result = await (toolHandlers as any)["qna_tool"](
                        sandbox,
                        eventStream,
                        toolCall.arguments,
                        { userId, projectId }
                    );
                    eventStream.send("tool_call_end", { name: toolCall.name });
                    console.log(toolCall.name, " | ", JSON.stringify(toolCall.arguments), " | ", toolCall);
                    return { toolCall, result };
                })
            );

            for (const item of qnaResults) {
                messages.push({
                    role: "AI",
                    type: "TOOL_CALL",
                    name: item.toolCall.name,
                    callId: item.toolCall.id,
                    arguments: item.toolCall.arguments,
                    result: item.result,
                    reasoning_content: response.reasoning_content,
                });
            }
            await storeInRedis(key, messages);
        }

        for (const toolCall of otherCalls) {
            calledTool = true;
            const handler = (toolHandlers as any)[toolCall.name];

            if (!handler) {
                messages.push({ role: "AI", type: "TEXT", content: `Tool ${toolCall.name} not found` });
                await storeInRedis(key, messages);
                continue;
            }
            eventStream.send("tool_call", { name: toolCall.name, arguments: toolCall.arguments });
            const result = await handler(sandbox, eventStream, toolCall.arguments, { userId, projectId });
            eventStream.send("tool_call_end", { name: toolCall.name });
            console.log(toolCall.name, " | ", JSON.stringify(toolCall.arguments), " | ", toolCall);
            messages.push({
                role: "AI",
                type: "TOOL_CALL",
                name: toolCall.name,
                callId: toolCall.id,
                arguments: toolCall.arguments,
                result,
                reasoning_content: response.reasoning_content,
            });
            await storeInRedis(key, messages);
        }

        if (!calledTool) {
            break;
        }
    }
    eventStream.send("done", {});
    const newMessages = messages.slice(messagesLength);
    const data = newMessages.map((message)=>{

        const value:{projectId:string,role:Role,type:MessageType,content:string,toolCall?:ToolCall} = {
            projectId,
            role: message.role,
            type: message.type,
            content: message.type==="TEXT" ? (message.content||""):JSON.stringify({arguments:message.arguments,callId:message.callId,result:message.result,content:message.content,reasoning_content:message.reasoning_content}),
            toolCall: message.type==="TOOL_CALL" ? message.name.toUpperCase() as ToolCall : undefined,
        };
        return value;
    })
    await prisma.history.createMany({
        data: [...data]
    });

    if (template !== "node-react-native-expo") {
        try {
            const host = sandbox.getHost(3000);
            if (host) {
                const targetUrl = "http://" + host;
                captureProjectScreenshot(projectId, targetUrl).catch((err) => {
                    console.log("Background screenshot error:", err);
                });
            }
        } catch (e) {
            
        }
    }
}