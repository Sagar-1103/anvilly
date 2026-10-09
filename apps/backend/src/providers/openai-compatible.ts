import OpenAI from "openai";
import type {
  LLMProvider,
  LLMResponse,
  LLMToolCall,
  ToolDefinition,
  ChatMessage,
} from "./types";

export interface OpenAICompatibleConfig {
  apiKey: string;
  baseURL?: string;
  defaultModel?: string;
  providerName?: string;
}

/**
 * Single unified provider for all OpenAI-specification compliant APIs:
 * - OpenAI (gpt-4o, gpt-4o-mini)
 * - DeepSeek (deepseek-chat, deepseek-reasoner)
 * - OpenRouter (deepseek/deepseek-chat, etc.)
 */
export class OpenAICompatibleProvider implements LLMProvider {
  private client: OpenAI;
  public readonly baseURL: string;
  public readonly defaultModel: string;
  public readonly providerName: string;
  private readonly isDeepSeek: boolean;

  constructor(config: OpenAICompatibleConfig) {
    this.baseURL = config.baseURL || "https://api.openai.com/v1";
    this.defaultModel = config.defaultModel || "gpt-4o";
    this.providerName = (config.providerName || "openai").toLowerCase();
    this.isDeepSeek =
      this.baseURL.includes("deepseek") || this.providerName === "deepseek";

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: this.baseURL,
    });
  }

  async chat(params: {
    model?: string;
    systemPrompt: string;
    messages: ChatMessage[];
    tools: ToolDefinition[];
  }): Promise<LLMResponse> {
    const { model, systemPrompt, messages, tools } = params;
    const activeModel = model || this.defaultModel;

    // 1. Sanitize messages to standard OpenAI format:
    // Only pass reasoning_content to DeepSeek to prevent OpenAI/others from throwing 400 Bad Request
    const sanitizedMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => {
        const item: any = {
          role: m.role,
          content: m.content ?? "",
        };

        if (m.tool_calls) {
          item.tool_calls = m.tool_calls;
        }
        if (m.tool_call_id) {
          item.tool_call_id = m.tool_call_id;
        }

        if (this.isDeepSeek && m.reasoning_content) {
          item.reasoning_content = m.reasoning_content;
        }

        return item;
      }),
    ];

    const response = await this.client.chat.completions.create({
      model: activeModel,
      messages: sanitizedMessages,
      tools: tools.map((t) => ({
        type: "function" as const,
        function: t.function,
      })),
    });

    const choice = response?.choices?.[0];
    if (!choice) {
      if ((response as any)?.error) {
        const errObj = (response as any).error;
        throw new Error(errObj?.message || errObj?.code || JSON.stringify(errObj));
      }
      return { text: null, toolCalls: [] };
    }

    const message = choice.message;
    const text = message?.content || null;

    // Capture reasoning_content if returned by provider (DeepSeek, OpenRouter R1)
    const reasoning_content =
      (message as any).reasoning_content ||
      (message as any).reasoning ||
      null;

    const toolCalls: LLMToolCall[] = (message.tool_calls || []).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }));

    return { text, toolCalls, reasoning_content };
  }

  async generateText(params: {
    model?: string;
    prompt: string;
  }): Promise<string> {
    const { model, prompt } = params;
    const activeModel = model || this.defaultModel;

    const response = await this.client.chat.completions.create({
      model: activeModel,
      messages: [{ role: "user", content: prompt }],
    });

    return response?.choices?.[0]?.message?.content || "";
  }
}
