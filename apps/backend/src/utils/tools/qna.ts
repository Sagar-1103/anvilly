import type Sandbox from "@e2b/code-interpreter";
import type { EventStream } from "../event-stream";

export const qnaTool = {
    type:'function',
    name:"qna_tool",
    description: "Ask the user a clarification question whenever required information is missing or ambiguous. Use this tool only when you cannot confidently continue generating the project without additional user input. Do not ask for information that can be reasonably inferred from the user's prompt or previous context.",
    parameters:{
        type:"object",
        properties:{
            question: {
                type: "string",
                description:"A single, clear clarification question. Keep it short, direct, and focused on one decision. Do not include explanations, suggestions, or multiple questions."
            },
            options: {
                type: "array",
                description: "Optional concise answer choices that help the user respond quickly. Include only realistic options. If the answer is free-form, omit this field.",
                items: { type:"string" }
            },
            recommended: {
                type:"number",
                description:"The zero-based index of the option that is recommended as the default choice based on best practices. Only provide this when 'options' is present."
            }
        },
        required: ["question"]
    }
}

export const qnaToolHandler = async(sandbox:Sandbox, eventStream:EventStream, args:{ question: string, recommended: string }) => {
    const questionId = crypto.randomUUID();
    const { question, recommended } = args;

    eventStream.send("question",{questionId,question,recommended});

    return recommended ?? "Do as you please";
}