import { z } from "zod";

export const createProjectSchema = z.object({
    userPrompt: z.string().min(1,"User prompt is required"),
});

export const answerQuestionSchema = z.object({
    questionId: z.string().min(1, "Question ID is required"),
    answer: z.string().min(1, "Answer is required"),
});

export const updateProjectSchema = z.object({
    userPrompt: z.string(),
});