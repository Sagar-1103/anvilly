import type Sandbox from "e2b";
import type { Response } from "express";
import type { EventStream } from "../event-stream";

export const qnaTool = {
    type:'function',
    name:"qna_tool",
    description: "this tool is for asking questions to the users project",
    parameters:{
        type:"object",
        properties:{
            question: {
                type: "string",
                description:"questions related to the project/userprompt (dont add any suggestions in the question)"
            },
            recommended: {
                type:"string",
                description:"summarized recommended answer to the question"
            }
        },
        required: ["question","recommended"]
    }
}

export const qnaToolHandler = async(sandbox:Sandbox, eventStream:EventStream, args:{ question: string, recommended: string }) => {
    const questionId = crypto.randomUUID();
    const { question, recommended } = args;

    eventStream.send("question",{questionId,question,recommended});

    return recommended;
}