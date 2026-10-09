import type { LLMProvider } from "../providers";
import type { ChatMessage } from "../providers/types";
import { getSystemPrompt } from "./prompt";
import type { Message, MessageType, Role, ToolCall, AiToolCallMessage } from "./types";
import { getAgentState, messagesToChatMessages } from "./helper-functions";
import { runCompactionPipeline, type CompactedStatePayload } from "./compaction";
import type { EventStream } from "./event-stream";
import { toolHandlers, tools } from "./tools";
import type Sandbox from "@e2b/code-interpreter";
import { prisma } from "@repo/db";
import { saveActiveSession, clearActiveSession, setAgentStateCache, invalidateChatCache } from "./redis";
import { captureProjectScreenshot } from "./screenshot";
import { classifyLLMError } from "./llm-error-handler";

const DEFAULT_MODEL = "deepseek-chat";

export const agentLoop = async (
    eventStream: EventStream,
    userId: string,
    projectId: string,
    sandbox: Sandbox,
    userPrompt: string,
    template: string | undefined,
    llmProvider: LLMProvider,
    modelName?: string
) => {
    const activeModel = modelName || (llmProvider as any)?.defaultModel || DEFAULT_MODEL;

    const previousState: CompactedStatePayload | null = await getAgentState(userId, projectId);

    const activeTurnMessages: Message[] = [
        { role: "USER", type: "TEXT", content: userPrompt }
    ];

    const turnStartedAt = Date.now();

    const syncActiveScratchpad = async () => {
        const activeTools = activeTurnMessages.map((m) => {
            if (m.type === "TOOL_CALL") {
                return { name: (m as any).name, callId: (m as any).callId };
            }
            return { role: m.role, type: m.type };
        });
        await saveActiveSession(userId, projectId, {
            turnStartedAt,
            userPrompt,
            inFlightTools: activeTools,
        });
    };

    await syncActiveScratchpad();

    while (true) {
        const chatMessages: ChatMessage[] = messagesToChatMessages(activeTurnMessages, {
            previousState,
            template,
        });

        let response;
        try {
            response = await llmProvider.chat({
                model: activeModel,
                systemPrompt: getSystemPrompt(template),
                messages: chatMessages,
                tools: tools,
            });
        } catch (chatError: any) {
            console.error("LLM Provider error in agentLoop:", chatError);
            const providerName = (llmProvider as any)?.providerName || "AI Provider";
            const classified = classifyLLMError(chatError, providerName);

            // 1. Notify frontend via SSE
            eventStream.send("error", classified);
            eventStream.send("text", classified.markdownMessage);
            eventStream.send("done", {});

            // 2. Persist turn cleanly to database so user prompt and AI explanation are saved
            try {
                const recordsToSave: Array<{
                    projectId: string;
                    role: Role;
                    type: MessageType;
                    content: string;
                    toolCall?: ToolCall;
                }> = [
                    {
                        projectId,
                        role: "USER",
                        type: "TEXT",
                        content: userPrompt,
                    },
                ];

                // Include any prior tools executed in this turn before the error occurred
                for (const msg of activeTurnMessages) {
                    if (msg.role === "AI" && msg.type === "TOOL_CALL" && (msg as AiToolCallMessage).name === "qna_tool") {
                        const qna = msg as AiToolCallMessage;
                        recordsToSave.push({
                            projectId,
                            role: "AI",
                            type: "TOOL_CALL",
                            content: JSON.stringify({ arguments: qna.arguments, callId: qna.callId, result: qna.result }),
                            toolCall: "QNA_TOOL",
                        });
                    }
                }

                // Add the AI error explanation as an assistant message
                recordsToSave.push({
                    projectId,
                    role: "AI",
                    type: "TEXT",
                    content: classified.markdownMessage,
                });

                await prisma.history.createMany({
                    data: recordsToSave,
                });
            } catch (dbErr) {
                console.error("Failed to save error record to history:", dbErr);
            }

            // 3. Clean up Redis active session and invalidate cache
            await clearActiveSession(userId, projectId);
            await invalidateChatCache(userId, projectId);

            // Cleanly exit the agent loop
            return;
        }

        if (response.text) {
            eventStream.send("text", response.text);
            activeTurnMessages.push({ role: "AI", type: "TEXT", content: response.text, reasoning_content: response.reasoning_content });
            await syncActiveScratchpad();
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
                    // console.log(toolCall.name, " | ", JSON.stringify(toolCall.arguments), " | ", toolCall);
                    return { toolCall, result };
                })
            );

            for (const item of qnaResults) {
                activeTurnMessages.push({
                    role: "AI",
                    type: "TOOL_CALL",
                    name: item.toolCall.name,
                    callId: item.toolCall.id,
                    arguments: item.toolCall.arguments,
                    result: item.result,
                    reasoning_content: response.reasoning_content,
                });
            }
            await syncActiveScratchpad();
        }

        for (const toolCall of otherCalls) {
            calledTool = true;
            const handler = (toolHandlers as any)[toolCall.name];

            if (!handler) {
                activeTurnMessages.push({ role: "AI", type: "TEXT", content: `Tool ${toolCall.name} not found` });
                await syncActiveScratchpad();
                continue;
            }
            eventStream.send("tool_call", { name: toolCall.name, arguments: toolCall.arguments });
            const result = await handler(sandbox, eventStream, toolCall.arguments, { userId, projectId });
            eventStream.send("tool_call_end", { name: toolCall.name });
            console.log(toolCall.name, " | ", JSON.stringify(toolCall.arguments), " | ", toolCall);
            activeTurnMessages.push({
                role: "AI",
                type: "TOOL_CALL",
                name: toolCall.name,
                callId: toolCall.id,
                arguments: toolCall.arguments,
                result,
                reasoning_content: response.reasoning_content,
            });
            await syncActiveScratchpad();
        }

        if (!calledTool) {
            break;
        }
    }
    eventStream.send("done", {});

    const currentTurnTools = activeTurnMessages.filter(
        (m) => m.role === "AI" && m.type === "TOOL_CALL"
    ) as AiToolCallMessage[];

    const lastAiTextMessage = [...activeTurnMessages].reverse().find((m) => m.role === "AI" && m.type === "TEXT");
    const aiResponseText = lastAiTextMessage?.content || "";

    const previousTurnCount = previousState?.recentDialogue
        ? (previousState.historySummary?.turnsCovered || 0) + previousState.recentDialogue.length
        : 0;
    const turnNumber = previousTurnCount + 1;

    // Execute Tiered Compaction Pipeline (Tool eviction, Delta, Sliding Window, LLM Summarization)
    const compactedPayload = await runCompactionPipeline({
        previousState,
        turnNumber,
        userPrompt,
        aiResponseText,
        currentTurnTools,
        llmProvider,
        modelName: activeModel,
    });

    // Removal of raw tool calls
    const recordsToSave: Array<{
        projectId: string;
        role: Role;
        type: MessageType;
        content: string;
        toolCall?: ToolCall;
    }> = [];

    recordsToSave.push({
        projectId,
        role: "USER",
        type: "TEXT",
        content: userPrompt,
    });

    for (const msg of activeTurnMessages) {
        if (msg.role === "AI" && msg.type === "TOOL_CALL" && (msg as AiToolCallMessage).name === "qna_tool") {
            const qna = msg as AiToolCallMessage;
            recordsToSave.push({
                projectId,
                role: "AI",
                type: "TOOL_CALL",
                content: JSON.stringify({ arguments: qna.arguments, callId: qna.callId, result: qna.result }),
                toolCall: "QNA_TOOL",
            });
        }
    }

    if (aiResponseText) {
        recordsToSave.push({
            projectId,
            role: "AI",
            type: "TEXT",
            content: aiResponseText,
        });
    }

    recordsToSave.push({
        projectId,
        role: "AI",
        type: "TOOL_CALL",
        content: JSON.stringify(compactedPayload),
        toolCall: "COMPACTED_STATE",
    });

    await prisma.$transaction([
        prisma.history.deleteMany({
            where: {
                projectId,
                toolCall: "COMPACTED_STATE",
            },
        }),
        prisma.history.createMany({
            data: recordsToSave,
        }),
    ]);

    await clearActiveSession(userId, projectId);

    await setAgentStateCache(userId, projectId, compactedPayload);

    await invalidateChatCache(userId, projectId);

    if (template !== "node-react-native-expo") {
        try {
            const host = sandbox.getHost(3000);
            if (host) {
                const targetUrl = "https://" + host;
                captureProjectScreenshot(projectId, targetUrl).catch((err) => {
                    console.log("Background screenshot error:", err);
                });
            }
        } catch (e) {
            
        }
    }
}