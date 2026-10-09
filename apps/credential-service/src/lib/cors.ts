import { env } from "../config/env";

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Secret",
  };

  if (!origin) {
    if (env.corsOrigins[0]) {
      headers["Access-Control-Allow-Origin"] = env.corsOrigins[0];
      headers["Access-Control-Allow-Credentials"] = "true";
    }
    return headers;
  }

  const isAllowed = env.corsOrigins.includes("*") || env.corsOrigins.includes(origin);

  if (isAllowed) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Vary"] = "Origin";
  }

  return headers;
}
