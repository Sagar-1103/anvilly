export type Role = "AI" | "USER";
export type MessageType = "TEXT" | "TOOL_CALL";

export type ToolCall = "BASH_TOOL" | "BUILD_PROJECT_TOOL" | "CREATE_FILE_TOOL" | "DELETE_FILE_TOOL" | "QNA_TOOL" | "READ_FILE_TOOL" | "RUN_PROJECT_TOOL" | "UPDATE_FILE_TOOL" | "WRITE_FILE_TOOL";

interface UserMessage {
    role: "USER";
    type: "TEXT";
    content: string;
}

interface AiTextMessage {
    role: "AI";
    type: "TEXT";
    content: string;
    reasoning_content?: string | null;
}

export interface AiToolCallMessage {
    role: "AI";
    type: "TOOL_CALL";
    name: string;
    arguments: unknown;
    callId: string;
    result?: unknown;
    content?: string;
    reasoning_content?: string | null;
}

export type Message = UserMessage | AiTextMessage | AiToolCallMessage;

export type EventType = "project" | "question" | "text" | "tool_call" | "restart_project";