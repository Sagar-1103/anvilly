import { z } from "zod";

export const createProjectSchema = z.object({
    userPrompt: z.string().min(1,"User prompt is required"),
});