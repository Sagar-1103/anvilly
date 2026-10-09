import type { Request, Response, NextFunction } from "express";
import type { AiToolCallMessage, Message } from "./types";
import type { ChatMessage } from "../providers/types";
import { getAgentStateCache, setAgentStateCache, getChatCache, setChatCache } from "./redis";
import { prisma } from "@repo/db";
import { formatProjectStateManifest, type CompactedStatePayload } from "./compaction";

export const AsyncHandler = (fn: any) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        console.error("Error in AsyncHandler:", error);
        if (res.headersSent) {
            if (!res.writableEnded) {
                res.write(`event: error\ndata: ${JSON.stringify({ message: error instanceof Error ? error.message : String(error) })}\n\n`);
                res.end();
            }
            return;
        }
        return res.status(500).json({ success: false, error: error instanceof Error ? error.message : error });
    }
};

export const getUserId = (req: Request) => {
    return req.userId;
};

// Get compacted agent state from Redis or DB
export const getAgentState = async (userId: string, projectId: string): Promise<CompactedStatePayload | null> => {
    // 1. Check Redis cache
    const cached = await getAgentStateCache(userId, projectId);
    if (cached) {
        return cached;
    }

    // 2. Fallback to DB checkpoint
    const record = await prisma.history.findFirst({
        where: {
            projectId,
            toolCall: "COMPACTED_STATE",
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    if (record) {
        try {
            const payload: CompactedStatePayload = JSON.parse(record.content);
            await setAgentStateCache(userId, projectId, payload);
            return payload;
        } catch (error) {
            console.error("Error parsing COMPACTED_STATE record from PostgreSQL:", error);
        }
    }

    // 3. Fallback for older projects without compaction
    const existingMessages = await prisma.history.findMany({
        where: {
            projectId,
            project: { userId },
        },
        orderBy: { createdAt: "asc" },
    });

    if (existingMessages.length === 0) {
        return null;
    }

    const userPrompts = existingMessages.filter((m) => m.role === "USER" && m.type === "TEXT");
    const rootGoal = userPrompts[0]?.content || "Initial project goal";
    const lastUserPrompt = userPrompts[userPrompts.length - 1]?.content || "";
    const lastAiText = [...existingMessages].reverse().find((m) => m.role === "AI" && m.type === "TEXT")?.content || "";

    const syntheticPayload: CompactedStatePayload = {
        version: 1,
        updatedAt: Date.now(),
        rootGoal,
        workspace: {
            files: [],
            buildPassing: true,
            serverRunning: false,
        },
        historySummary: {
            turnsCovered: Math.max(1, userPrompts.length - 1),
            summary: "Prior conversation turns before context compaction.",
            keyDecisions: [],
        },
        recentDialogue: lastUserPrompt ? [{
            turn: userPrompts.length,
            userPrompt: lastUserPrompt,
            aiResponse: lastAiText,
        }] : [],
        toolReceipts: [],
    };

    await setAgentStateCache(userId, projectId, syntheticPayload);
    return syntheticPayload;
};

// Get chat messages for the frontend UI
export const getClientChatMessages = async (userId: string, projectId: string): Promise<Message[]> => {
    // 1. Check Redis cache
    const cached = await getChatCache(userId, projectId);
    if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached;
    }

    // 2. Fetch from DB if cache miss
    const dbMessages = await prisma.history.findMany({
        where: {
            projectId,
            project: { userId },
            OR: [
                { toolCall: null },
                { toolCall: { not: "COMPACTED_STATE" } },
            ],
        },
        orderBy: { createdAt: "asc" },
    });

    const messages: Message[] = dbMessages.map((msg) => {
        if (msg.type === "TOOL_CALL" && msg.toolCall) {
            const parsed = JSON.parse(msg.content);
            return {
                role: "AI",
                type: "TOOL_CALL",
                name: msg.toolCall.toLowerCase(),
                content: parsed.content || msg.content,
                arguments: parsed.arguments || {},
                callId: parsed.callId || `call-${msg.id}`,
                result: parsed.result,
                reasoning_content: parsed.reasoning_content ?? "",
            };
        }
        return {
            role: msg.role === "AI" ? "AI" : "USER",
            type: "TEXT",
            content: msg.content,
            reasoning_content: "",
        };
    });

    if (messages.length > 0) {
        await setChatCache(userId, projectId, messages);
    }

    return messages;
};

// Convert messages to provider format (adds state blueprint & last 2 turns)
export const messagesToChatMessages = (
    activeTurnMessages: Message[],
    options?: { previousState?: CompactedStatePayload | null; template?: string }
): ChatMessage[] => {
    const chatMessages: ChatMessage[] = [];

    // 1. Inject state blueprint and last 2 turns
    if (options?.previousState) {
        const payload = options.previousState;

        // Blueprint (files, goal, summary)
        chatMessages.push({
            role: "system",
            content: formatProjectStateManifest(payload, options?.template),
        });

        // Last 2 turns verbatim
        if (payload.recentDialogue && payload.recentDialogue.length > 0) {
            for (const turn of payload.recentDialogue) {
                chatMessages.push({ role: "user", content: turn.userPrompt });
                chatMessages.push({ role: "assistant", content: turn.aiResponse });
            }
        }
    }

    // 2. Process current turn messages
    let i = 0;
    while (i < activeTurnMessages.length) {
        const msg = activeTurnMessages[i];
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
            // Group tool calls into one message
            const toolCalls: Array<{
                id: string;
                type: "function";
                function: { name: string; arguments: string };
            }> = [];
            const toolResults: Array<{ tool_call_id: string; content: string }> = [];

            let current = activeTurnMessages[i];
            while (i < activeTurnMessages.length && current && current.role === "AI" && current.type === "TOOL_CALL") {
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
                current = activeTurnMessages[i];
            }

            const firstTc = activeTurnMessages[i - toolCalls.length] as AiToolCallMessage;
            const assistantMsg: ChatMessage = {
                role: "assistant",
                content: null,
                reasoning_content: firstTc?.reasoning_content ?? "",
                tool_calls: toolCalls,
            };
            chatMessages.push(assistantMsg);

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
};
