import type { Response } from "express";
import { sendChunk } from "../helper-functions";

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

export const qnaToolHandler = async(args:{ question: string, recommended: string },res: Response) => {
    const questionId = crypto.randomUUID();
    const { question, recommended } = args;
    sendChunk({type:"question",payload:{questionId,question,recommended}},res);

    //TODO: take input from user

    return recommended;
}