export interface Project {
    title:string;
    url:string;
}

export interface QuestionPayload {
    questionId: string;
    question: string;
    options?: string[];
    recommended?: number;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "question";
    content: string;
    questionData?: QuestionPayload;
    answered?: boolean;
    selectedAnswer?: string;
    createdAt?: string;
}