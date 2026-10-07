import { z } from "zod";

export const createProjectSchema = z.object({
    userPrompt: z.string().min(1,"User prompt is required"),
    template: z.enum(["bun_react_shadcn", "node_react_native_expo"]).optional().default("bun_react_shadcn"),
});

export const answerQuestionSchema = z.object({
    questionId: z.string().min(1, "Question ID is required"),
    answer: z.string().min(1, "Answer is required"),
});

export const updateProjectSchema = z.object({
    userPrompt: z.string(),
});

export const updateProjectMetadataSchema = z.object({
    title: z.string().trim().min(1, "Title cannot be empty").max(100, "Title cannot exceed 100 characters").optional(),
    description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional(),
});