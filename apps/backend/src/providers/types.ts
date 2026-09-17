export interface ToolDefinition {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
    };
}

export interface LLMResponse {
    text: string | null;
    toolCalls: LLMToolCall[];
    reasoning_content?: string | null;
}

export interface LLMToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

export type ChatMessage =
    | { role: "system"; content: string }
    | { role: "user"; content: string }
    | {
          role: "assistant";
          content: string | null;
          reasoning_content?: string | null;
          tool_calls?: Array<{
              id: string;
              type: "function";
              function: { name: string; arguments: string };
          }>;
      }
    | { role: "tool"; tool_call_id: string; content: string };

export interface LLMProvider {
    chat(params: {
        model: string;
        systemPrompt: string;
        messages: ChatMessage[];
        tools: ToolDefinition[];
    }): Promise<LLMResponse>;

    generateText(params: {
        model: string;
        prompt: string;
    }): Promise<string>;
}
