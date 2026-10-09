export interface ClassifiedLLMError {
  type: "RATE_LIMIT" | "INSUFFICIENT_QUOTA" | "INVALID_KEY" | "SERVICE_UNAVAILABLE" | "UNKNOWN";
  title: string;
  toastMessage: string;
  markdownMessage: string;
  provider: string;
  status?: number;
}

export function classifyLLMError(err: any, rawProvider: string = "AI Provider"): ClassifiedLLMError {
  const status =
    err?.status ||
    err?.statusCode ||
    err?.code ||
    err?.error?.code ||
    err?.response?.status;

  const rawMessage =
    err?.message ||
    err?.error?.message ||
    (typeof err === "string" ? err : "") ||
    "";
  const msgLower = rawMessage.toLowerCase();

  const provider = rawProvider ? rawProvider.charAt(0).toUpperCase() + rawProvider.slice(1) : "AI Provider";

  // 1. Rate Limit (HTTP 429)
  if (
    status === 429 ||
    status === "429" ||
    msgLower.includes("rate limit") ||
    msgLower.includes("too many requests") ||
    msgLower.includes("rate_limit") ||
    msgLower.includes("tokens per minute") ||
    msgLower.includes("requests per minute") ||
    (msgLower.includes("provider returned error") && (status === 429 || msgLower.includes("429")))
  ) {
    return {
      type: "RATE_LIMIT",
      title: "Rate Limit Exceeded",
      toastMessage: `Rate limit reached on ${provider}. Please wait a few seconds or switch models.`,
      markdownMessage: `**Rate Limit Reached (HTTP 429)**\n\nThe request to **${provider}** was rate-limited. This typically occurs on free tiers, shared community endpoints, or when exceeding requests-per-minute limits.\n\n**Suggested actions:**\n- **Wait 15–30 seconds** and resend your prompt.\n- **Switch model/provider** using the model selector below (e.g. DeepSeek or OpenAI).\n- **Add a dedicated API key** with higher quota limits in your **API Settings**.`,
      provider,
      status: 429,
    };
  }

  // 2. Insufficient Quota / Credits (HTTP 402)
  if (
    status === 402 ||
    status === "402" ||
    msgLower.includes("insufficient_quota") ||
    msgLower.includes("insufficient credits") ||
    msgLower.includes("quota exceeded") ||
    msgLower.includes("credit balance is too low") ||
    msgLower.includes("payment required")
  ) {
    return {
      type: "INSUFFICIENT_QUOTA",
      title: "Insufficient Credits",
      toastMessage: `Your ${provider} account has run out of credits or quota.`,
      markdownMessage: `**Quota / Credits Depleted (HTTP 402)**\n\nYour **${provider}** account does not have sufficient credits or token quota remaining to complete this request.\n\n**Suggested actions:**\n- Top up your balance in your **${provider}** account dashboard.\n- Switch to another provider or model using the selector at the bottom.\n- Add or update your API key in **API Settings**.`,
      provider,
      status: 402,
    };
  }

  // 3. Invalid API Key / Unauthorized (HTTP 401)
  if (
    status === 401 ||
    status === "401" ||
    msgLower.includes("invalid api key") ||
    msgLower.includes("unauthorized") ||
    msgLower.includes("authentication_error") ||
    msgLower.includes("incorrect api key")
  ) {
    return {
      type: "INVALID_KEY",
      title: "Invalid API Key",
      toastMessage: `The API key for ${provider} is invalid or expired.`,
      markdownMessage: `**Invalid API Key (HTTP 401)**\n\nThe API key configured for **${provider}** was rejected by the provider.\n\n**Suggested actions:**\n- Click **API Keys** in the menu and verify that your key is active and correctly formatted.\n- Delete and re-enter the API key.`,
      provider,
      status: 401,
    };
  }

  // 4. Provider Down / Server Overloaded (HTTP 502 / 503 / 504)
  if (
    status === 502 ||
    status === 503 ||
    status === 504 ||
    msgLower.includes("overloaded") ||
    msgLower.includes("bad gateway") ||
    msgLower.includes("gateway timeout") ||
    msgLower.includes("service unavailable")
  ) {
    return {
      type: "SERVICE_UNAVAILABLE",
      title: "Provider Service Unavailable",
      toastMessage: `${provider} is currently experiencing high load or downtime.`,
      markdownMessage: `**Provider Service Temporarily Unavailable**\n\n**${provider}** servers returned a temporary error. The provider is experiencing high traffic or temporary downtime.\n\n**Suggested actions:**\n- Wait a moment and try again.\n- Switch to an alternative provider or model.`,
      provider,
      status: typeof status === "number" ? status : 503,
    };
  }

  // 5. Unknown / Generic Error
  return {
    type: "UNKNOWN",
    title: "AI Generation Error",
    toastMessage: `${provider} returned an error: ${rawMessage.slice(0, 80) || "Request failed"}`,
    markdownMessage: `**Generation Error**\n\n**${provider}** returned an error while processing your request:\n> ${rawMessage || "Unknown upstream provider error"}\n\n**Suggested actions:**\n- Resend your message.\n- Switch to another model or provider in the selector.`,
    provider,
    status: typeof status === "number" ? status : 500,
  };
}
