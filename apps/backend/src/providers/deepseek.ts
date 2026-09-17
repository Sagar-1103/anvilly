import OpenAI from "openai";
import type {
    LLMProvider,
    LLMResponse,
    LLMToolCall,
    ToolDefinition,
    ChatMessage,
} from "./types";

export class DeepSeekProvider implements LLMProvider {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey,
            baseURL: "https://api.deepseek.com",
        });
    }

    async chat(params: {
        model: string;
        systemPrompt: string;
        messages: ChatMessage[];
        tools: ToolDefinition[];
    }): Promise<LLMResponse> {
        const { model, systemPrompt, messages, tools } = params;

        const allMessages: OpenAI.ChatCompletionMessageParam[] = [
            { role: "system", content: systemPrompt },
            ...(messages as OpenAI.ChatCompletionMessageParam[]),
        ];

        const response = await this.client.chat.completions.create({
            model,
            messages: allMessages,
            tools: tools.map((t) => ({
                type: "function" as const,
                function: t.function,
            })),
        });

        const choice = response.choices[0];
        if (!choice) {
            return { text: null, toolCalls: [] };
        }

        const message = choice.message;

        const text = message.content || null;
        const reasoning_content = (message as any).reasoning_content || null;

        const toolCalls: LLMToolCall[] = (message.tool_calls || []).map(
            (tc) => ({
                id: tc.id,
                name: tc.function.name,
                arguments: JSON.parse(tc.function.arguments),
            })
        );

        return { text, toolCalls, reasoning_content };
    }

    async generateText(params: {
        model: string;
        prompt: string;
    }): Promise<string> {
        const { model, prompt } = params;

        const response = await this.client.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }],
        });

        return response.choices[0]?.message.content || "";
    }
}
