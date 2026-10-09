import { env } from "../constants/env";

export function getCorsHeaders(req?: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Secret",
  };

  const origin = req?.headers?.get("origin");
  const configuredOrigins = env.corsOrigin
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  if (!origin) {
    const defaultOrigin = configuredOrigins[0] || "*";
    headers["Access-Control-Allow-Origin"] = defaultOrigin;
    if (defaultOrigin !== "*") {
      headers["Access-Control-Allow-Credentials"] = "true";
    }
    return headers;
  }

  const isAllowed = configuredOrigins.includes("*") || configuredOrigins.includes(origin);

  if (isAllowed) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Vary"] = "Origin";
  }

  return headers;
}
