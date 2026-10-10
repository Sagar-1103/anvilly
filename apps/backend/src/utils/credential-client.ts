import { env } from "../constants/env";

export interface ResolvedCredential {
  id?: string;
  provider: string;
  apiKey: string;
  baseURL: string;
  defaultModel: string;
  keyPreview: string;
}

// Fetch user's LLM credentials from credential service
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
      payload.provider = "deepseek"; // default to deepseek
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

export interface ResolvedExpoToken {
  token: string;
  username?: string;
  keyPreview?: string;
}

// Fetch user's Expo token for EAS builds
export async function resolveUserExpoToken(
  userId: string
): Promise<ResolvedExpoToken | null> {
  try {
    const url = `${env.credentialServiceUrl}/api/v1/expo-token/resolve`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": env.internalServiceSecret,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      console.warn(`[CredentialClient] Failed to resolve Expo token (${response.status}): ${errorText}`);
      return null;
    }

    const data = (await response.json()) as {
      success: boolean;
      token?: string;
      username?: string;
      keyPreview?: string;
    };

    if (data.success && data.token) {
      return {
        token: data.token,
        username: data.username,
        keyPreview: data.keyPreview,
      };
    }

    return null;
  } catch (error) {
    console.error("[CredentialClient] Error connecting to Credential Service for Expo token:", error);
    return null;
  }
}
