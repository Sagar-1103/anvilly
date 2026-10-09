import { OpenAICompatibleProvider } from "./openai-compatible";
import { resolveUserCredential } from "../utils/credential-client";
import type { LLMProvider } from "./types";

export const PROVIDER_PRESETS = {
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
} as const;

export type SupportedPresetProvider = keyof typeof PROVIDER_PRESETS;

export interface UserProviderResult {
  provider: LLMProvider;
  providerName: string;
  defaultModel: string;
  source: "user_credential";
}

/**
 * Dynamically resolves a single unified OpenAI-compatible provider for a user
 * based on their stored Vault credentials (by credentialId or provider name).
 */
export async function getProviderForUser(
  userId: string,
  target?: { credentialId?: string; provider?: string; model?: string } | string
): Promise<UserProviderResult> {
  const targetObj =
    typeof target === "string"
      ? target.includes("-") && target.length > 20
        ? { credentialId: target }
        : { provider: target }
      : target;

  // 1. Resolve user's key and endpoint config from Credential Vault
  const credential = await resolveUserCredential(userId, targetObj);

  if (credential) {
    const activeModel = targetObj?.model || credential.defaultModel;
    return {
      provider: new OpenAICompatibleProvider({
        apiKey: credential.apiKey,
        baseURL: credential.baseURL,
        defaultModel: activeModel,
        providerName: credential.provider,
      }),
      providerName: credential.provider,
      defaultModel: activeModel,
      source: "user_credential",
    };
  }

  // 2. If no user key, check if user has ANY other configured key
  if (!targetObj?.credentialId) {
    for (const altProvider of ["deepseek", "openai", "openrouter"] as const) {
      if (altProvider !== targetObj?.provider) {
        const altCred = await resolveUserCredential(userId, { provider: altProvider });
        if (altCred) {
          const activeModel = targetObj?.model || altCred.defaultModel;
          return {
            provider: new OpenAICompatibleProvider({
              apiKey: altCred.apiKey,
              baseURL: altCred.baseURL,
              defaultModel: activeModel,
              providerName: altCred.provider,
            }),
            providerName: altCred.provider,
            defaultModel: activeModel,
            source: "user_credential",
          };
        }
      }
    }
  }

  throw new Error(
    "No active API key found. Please configure your OpenAI, DeepSeek, or OpenRouter key in Settings."
  );
}

export { OpenAICompatibleProvider };

export type {
  LLMProvider,
  LLMResponse,
  LLMToolCall,
  ToolDefinition,
  ChatMessage,
} from "./types";
