export interface Project {
    id?: string;
    title: string;
    description?: string | null;
    url: string;
    template?: string;
    expoUrl?: string;
    tunnelUrl?: string;
}


export interface QuestionPayload {
    questionId: string;
    question: string;
    options?: string[];
    recommended?: number;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "question" | "action";
    content: string;
    questionData?: QuestionPayload;
    answered?: boolean;
    selectedAnswer?: string;
    createdAt?: string;
    actionType?: string;
    actionArgs?: any;
    actionDone?: boolean;
}

export interface SandboxFile {
    name: string;
    path: string;
    language: string;
    content: string;
}

export interface FileTreeNode {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileTreeNode[];
}