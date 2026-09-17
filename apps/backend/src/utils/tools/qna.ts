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

interface PendingQuestion {
    resolve: (answer: string) => void;
    timeoutId: ReturnType<typeof setTimeout>;
    fallbackResponse: string;
}

export const pendingQuestions = new Map<string, PendingQuestion>();

export const qnaToolHandler = async (
    sandbox: Sandbox,
    eventStream: EventStream,
    args: { question: string; options?: string[]; recommended?: number }
) => {
    try {
        const questionId = crypto.randomUUID();
        const { question, options, recommended } = args;

        let selectedAnswer = "User specified no preference, proceed with best design judgment";
        if (options && typeof recommended === "number" && options[recommended]) {
            selectedAnswer = options[recommended];
        } else if (options && options.length > 0 && options[0]) {
            selectedAnswer = options[0];
        }

        eventStream.send("question", {
            questionId,
            question,
            options,
            recommended,
            answered: true,
            selectedAnswer,
        });

        return selectedAnswer;
    } catch (error) {
        console.error(error);
        return { error: (error as Error).message };
    }
}