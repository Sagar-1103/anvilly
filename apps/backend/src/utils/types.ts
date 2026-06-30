export type Message = TextMessage | ToolCall ;

interface TextMessage {
    role: "AI" | "USER";
    content: string;
}

interface ToolCall {
    role: "TOOL_CALL",
    name?: string,
    arguments?: any,
    callId?: string,
    result?: any,
    content?: string,
}

export interface StreamMessage {
    type: "",
    
}

export type EventType = "project" | "question" | "text" | "tool_call"