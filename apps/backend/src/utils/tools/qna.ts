import type Sandbox from "@e2b/code-interpreter";
import type { EventStream } from "../event-stream";

import type { ToolDefinition } from "../../providers/types";

export const qnaTool: ToolDefinition = {
    type: 'function',
    function: {
        name: "qna_tool",
        description: "Ask the user a highly focused design, theme, layout, or feature clarification question to align the app's style and direction with their preferences. Use this when design, aesthetic choices, or layout decisions are ambiguous.",
        parameters: {
            type: "object",
            properties: {
                question: {
                    type: "string",
                    description: "A single, clear clarification question focusing on design style, theme, feature selection, or visual choices. Keep it concise."
                },
                options: {
                    type: "array",
                    description: "Concise, distinct answer choices representing premium themes, layouts, or feature scopes (e.g. ['Dark Mode + Violet Accent', 'Clean White + Minimalist']). Keep choices under 4 options.",
                    items: { type: "string" }
                },
                recommended: {
                    type: "number",
                    description: "The zero-based index of the option that is recommended as the default premium choice based on modern web design best practices."
                }
            },
            required: ["question"]
        },
    },
};

export interface PendingQuestion {
    resolve: (answer: string) => void;
    timeoutId: ReturnType<typeof setTimeout>;
    pingIntervalId?: ReturnType<typeof setInterval>;
    fallbackResponse: string;
    userId?: string;
    projectId?: string;
}

export const pendingQuestions = new Map<string, PendingQuestion>();

export const qnaToolHandler = async (
    sandbox: Sandbox,
    eventStream: EventStream,
    args: { question: string; options?: string[]; recommended?: number },
    context?: { userId?: string; projectId?: string }
): Promise<string | { error: string }> => {
    try {
        const questionId = crypto.randomUUID();
        const { question, options, recommended } = args;

        let fallbackResponse = "User specified no preference, proceed with best design judgment";
        if (options && typeof recommended === "number" && options[recommended]) {
            fallbackResponse = options[recommended];
        } else if (options && options.length > 0 && options[0]) {
            fallbackResponse = options[0];
        }

        eventStream.send("question", {
            questionId,
            question,
            options,
            recommended,
            answered: false,
        });

        return new Promise<string>((resolve) => {
            const pingIntervalId = setInterval(() => {
                eventStream.sendPing();
            }, 15000);

            const timeoutId = setTimeout(() => {
                cleanupAndResolve(fallbackResponse);
            }, 5 * 60 * 1000);

            const cleanupAndResolve = (answer: string) => {
                clearInterval(pingIntervalId);
                clearTimeout(timeoutId);
                eventStream.req.off("close", onClose);
                if (pendingQuestions.has(questionId)) {
                    pendingQuestions.delete(questionId);
                }
                resolve(answer);
            };

            const onClose = () => {
                cleanupAndResolve(fallbackResponse);
            };

            eventStream.req.once("close", onClose);

            pendingQuestions.set(questionId, {
                resolve: cleanupAndResolve,
                timeoutId,
                pingIntervalId,
                fallbackResponse,
                userId: context?.userId,
                projectId: context?.projectId,
            });
        });
    } catch (error) {
        console.error("Error in qnaToolHandler:", error);
        return { error: (error as Error).message };
    }
};