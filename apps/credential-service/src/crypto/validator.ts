export const SUPPORTED_PROVIDERS = [
  "openai",
  "deepseek",
  "openrouter",
] as const;

export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

export const PROVIDER_PRESETS: Record<
  SupportedProvider,
  { name: string; baseURL: string; defaultModel: string }
> = {
  openai: {
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
  },
  deepseek: {
    name: "DeepSeek",
    baseURL: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
  },
  openrouter: {
    name: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    defaultModel: "deepseek/deepseek-chat",
  },
};

export const PROVIDER_MODELS: Record<
  SupportedProvider,
  Array<{ id: string; name: string; isDefault?: boolean }>
> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o (Flagship)", isDefault: true },
    { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Cheap)" },
    { id: "o3-mini", name: "o3-mini (Reasoning)" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek-V3 (Chat)", isDefault: true },
    { id: "deepseek-flash", name: "DeepSeek Flash" },
    { id: "deepseek-reasoner", name: "DeepSeek-R1 (Reasoning)" },
  ],
  openrouter: [
    { id: "deepseek/deepseek-chat", name: "DeepSeek V3", isDefault: true },
    { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5" },
    { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
  ],
};

export function isValidProvider(provider: string): provider is SupportedProvider {
  return SUPPORTED_PROVIDERS.includes(provider.toLowerCase() as SupportedProvider);
}

export function validateApiKeyFormat(
  provider: SupportedProvider,
  key: string
): { valid: boolean; error?: string } {
  const trimmed = key.trim();
  if (!trimmed) {
    return { valid: false, error: "API key cannot be empty" };
  }

  if (trimmed.length < 8) {
    return { valid: false, error: "API key is too short" };
  }

  switch (provider) {
    case "openai":
      if (!trimmed.startsWith("sk-")) {
        return { valid: false, error: "OpenAI API keys typically start with 'sk-'" };
      }
      break;
    case "deepseek":
      if (!trimmed.startsWith("sk-")) {
        return { valid: false, error: "DeepSeek API keys typically start with 'sk-'" };
      }
      break;
    case "openrouter":
      if (!trimmed.startsWith("sk-or-")) {
        return { valid: false, error: "OpenRouter API keys typically start with 'sk-or-'" };
      }
      break;
  }

  return { valid: true };
}
