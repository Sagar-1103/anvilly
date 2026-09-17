import type { Request, Response, NextFunction } from "express"
import type { AiToolCallMessage, Message } from "./types";
import type { ChatMessage } from "../providers/types";
import { redisClient, storeInRedis } from "./redis";
import { prisma } from "@repo/db/client";
import type Sandbox from "@e2b/code-interpreter";

export const AsyncHandler = (fn: any) => async(req:Request, res:Response, next: NextFunction) => {
    try {
        await fn(req,res,next);
    } catch (error) {
        console.error("Error in AsyncHandler:", error);
        if (res.headersSent) {
            if (!res.writableEnded) {
                res.write(`event: error\ndata: ${JSON.stringify({ message: error instanceof Error ? error.message : String(error) })}\n\n`);
                res.end();
            }
            return;
        }
        return res.status(500).json({success:false, error: error instanceof Error ? error.message : error});
    }
}

export const getUserId = (req:Request) => {
    return req.userId;
}

export const parseHistory = (messages: Message[]) => {
    const history = messages.map((m) => {
        if (m.role==="USER") {
            return `ROLE:${m.role}, TYPE:${m.type}, CONTENT:${m.content}`;
        } else {
            if (m.type==="TEXT") {
                return `ROLE:${m.role}, TYPE:${m.type}, CONTENT:${m.content}`;
            }
            return `ROLE:${m.role}, TYPE:${m.type},TOOL_NAME:${m.name}, ARGS:${JSON.stringify(m.arguments)}, CALL_ID:${m.callId}, RESULT:${JSON.stringify(m.result)}`
        }
    }).join("\n\n");
    return history;
}

export const getMessages = async(userId:string,projectId:string) => {
    let messages: Message[] = [];
    const key = `${userId}-${projectId}`;
    let redisMessages = null;
    try {
        redisMessages = await redisClient.get(key);
    } catch (error) {
        console.error("REDIS GET ERROR:", error);
    }
    
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
                const parsed = JSON.parse(msg.content);
                return {
                    role:"AI",
                    type:"TOOL_CALL",
                    name:msg.toolCall.toLowerCase(),
                    content: parsed.content,
                    arguments: parsed.arguments,
                    callId: parsed.callId,
                    result: parsed.result,
                    reasoning_content: parsed.reasoning_content ?? "",
                };
            } else {
                return {
                    role:msg.role==="AI"?"AI":"USER",
                    type:"TEXT",
                    content: msg.content,
                    reasoning_content: "",
                }
            }
        });
        await storeInRedis(key,messages);
    } else {
        messages = JSON.parse(redisMessages);
    }

    return messages;
}

/**
 * Convert internal Message[] format to OpenAI-compatible ChatMessage[] for the provider.
 * Groups consecutive tool calls from the same assistant turn and pairs them with tool results.
 */
export const messagesToChatMessages = (messages: Message[]): ChatMessage[] => {
    const chatMessages: ChatMessage[] = [];

    let i = 0;
    while (i < messages.length) {
        const msg = messages[i];
        if (!msg) { i++; continue; }

        if (msg.role === "USER") {
            chatMessages.push({ role: "user", content: msg.content ?? "" });
            i++;
        } else if (msg.type === "TEXT") {
            const assistantMsg: ChatMessage = {
                role: "assistant",
                content: msg.content,
                reasoning_content: msg.reasoning_content ?? "",
            };
            chatMessages.push(assistantMsg);
            i++;
        } else if (msg.type === "TOOL_CALL") {
            // Collect consecutive tool calls into a single assistant message
            const toolCalls: Array<{
                id: string;
                type: "function";
                function: { name: string; arguments: string };
            }> = [];
            const toolResults: Array<{ tool_call_id: string; content: string }> = [];

            let current = messages[i];
            while (i < messages.length && current && current.role === "AI" && current.type === "TOOL_CALL") {
                const tc = current as AiToolCallMessage;
                toolCalls.push({
                    id: tc.callId,
                    type: "function",
                    function: {
                        name: tc.name,
                        arguments: JSON.stringify(tc.arguments),
                    },
                });
                toolResults.push({
                    tool_call_id: tc.callId,
                    content: JSON.stringify(tc.result ?? ""),
                });
                i++;
                current = messages[i];
            }

            // Attach reasoning_content from the first tool call in this group (they share the same response)
            const firstTc = messages[i - toolCalls.length] as AiToolCallMessage;
            const assistantMsg: ChatMessage = {
                role: "assistant",
                content: null,
                reasoning_content: firstTc?.reasoning_content ?? "",
                tool_calls: toolCalls,
            };
            chatMessages.push(assistantMsg);

            // Add corresponding tool result messages
            for (const result of toolResults) {
                chatMessages.push({
                    role: "tool",
                    tool_call_id: result.tool_call_id,
                    content: result.content,
                });
            }
        } else {
            i++;
        }
    }

    return chatMessages;
}