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

export interface Chunk {
    type:"question" | "text",
    payload: any,
}

export interface StreamMessage {
    type: "",
    
}