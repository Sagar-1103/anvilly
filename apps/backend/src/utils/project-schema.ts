import { z } from "zod";

export const createProjectSchema = z.object({
    userPrompt: z.string().min(1,"User prompt is required"),
});

export const answerQuestionSchema = z.discriminatedUnion("type", [
    z.object({
        type:z.literal("option"),
        questionId: z.string(),
        answerIndex: z.number(),
    }),
    z.object({
        type:z.literal("custom"),
        questionId: z.string(),
        answer: z.string(),
    }),
]);

export const updateProjectSchema = z.object({
    userPrompt: z.string(),
});