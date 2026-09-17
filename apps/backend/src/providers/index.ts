import { env } from "../constants/env";
import { DeepSeekProvider } from "./deepseek";

export const provider = new DeepSeekProvider(env.deepseekApiKey);

export type {
    LLMProvider,
    LLMResponse,
    LLMToolCall,
    ToolDefinition,
    ChatMessage,
} from "./types";
