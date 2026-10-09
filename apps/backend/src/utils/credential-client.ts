import { env } from "../constants/env";

export interface ResolvedCredential {
  id?: string;
  provider: string;
  apiKey: string;
  baseURL: string;
  defaultModel: string;
  keyPreview: string;
}

/**
 * Resolves a decrypted API key and OpenAI endpoint config for a user from the Credential Service.
 * SECURITY: Internal service-to-service call over localhost/private VPC.
 */
export async function resolveUserCredential(
  userId: string,
  target?: { credentialId?: string; provider?: string }
): Promise<ResolvedCredential | null> {
  try {
    const url = `${env.credentialServiceUrl}/api/v1/credentials/resolve`;
    const payload: Record<string, string> = { userId };

    if (target?.credentialId) {
      payload.credentialId = target.credentialId;
    } else if (target?.provider) {
      payload.provider = target.provider;
    } else {
      payload.provider = "deepseek"; // default fallback preference
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": env.internalServiceSecret,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      console.warn(`[CredentialClient] Failed to resolve key (${response.status}): ${errorText}`);
      return null;
    }

    const data = (await response.json()) as { success: boolean } & ResolvedCredential;
    if (data.success && data.apiKey) {
      return data;
    }

    return null;
  } catch (error) {
    console.error("[CredentialClient] Error connecting to Credential Service:", error);
    return null;
  }
}
