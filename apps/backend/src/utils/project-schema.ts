import { z } from "zod";

export const createProjectSchema = z.object({
    userPrompt: z.string().min(1,"User prompt is required"),
    template: z.enum(["bun-react-shadcn", "node-react-native-expo"]).optional().default("bun-react-shadcn"),
});

export const answerQuestionSchema = z.object({
    questionId: z.string().min(1, "Question ID is required"),
    answer: z.string().min(1, "Answer is required"),
});

export const updateProjectSchema = z.object({
    userPrompt: z.string(),
});