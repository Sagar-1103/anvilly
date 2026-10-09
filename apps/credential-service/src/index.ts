import { env } from "./config/env";
import { handleHealth } from "./routes/health";
import {
  handleGetCredentials,
  handlePostCredential,
  handleDeleteCredential,
} from "./routes/credentials";
import { handleResolveCredential } from "./routes/resolve";
import { authenticateUser, verifyInternalSecret } from "./middleware/auth";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Secret",
};

function addCorsHeaders(res: Response): Response {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.headers.set(key, value);
  }
  return res;
}

const server = Bun.serve({
  port: env.port,
  hostname: env.host,

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const { pathname } = url;
    const method = req.method;

    // CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    try {
      // Health check
      if (pathname === "/health" && method === "GET") {
        return addCorsHeaders(handleHealth());
      }

      // User credentials
      if (pathname === "/api/v1/credentials") {
        const userId = authenticateUser(req);
        if (!userId) {
          return addCorsHeaders(
            Response.json({ success: false, message: "Unauthorized: Invalid or missing token" }, { status: 401 })
          );
        }

        if (method === "GET") {
          const res = await handleGetCredentials(userId);
          return addCorsHeaders(res);
        }

        if (method === "POST") {
          const res = await handlePostCredential(req, userId);
          return addCorsHeaders(res);
        }
      }

      if (pathname.startsWith("/api/v1/credentials/") && method === "DELETE") {
        const userId = authenticateUser(req);
        if (!userId) {
          return addCorsHeaders(
            Response.json({ success: false, message: "Unauthorized: Invalid or missing token" }, { status: 401 })
          );
        }

        const credentialId = pathname.slice("/api/v1/credentials/".length);
        if (!credentialId) {
          return addCorsHeaders(
            Response.json({ success: false, message: "Missing credential ID" }, { status: 400 })
          );
        }

        const res = await handleDeleteCredential(userId, credentialId);
        return addCorsHeaders(res);
      }

      // Internal key resolution
      if (pathname === "/api/v1/credentials/resolve" && method === "POST") {
        if (!verifyInternalSecret(req)) {
          return addCorsHeaders(
            Response.json({ success: false, message: "Forbidden: Invalid internal secret" }, { status: 403 })
          );
        }

        const res = await handleResolveCredential(req);
        return addCorsHeaders(res);
      }

      return addCorsHeaders(
        Response.json({ success: false, message: `Route not found: ${method} ${pathname}` }, { status: 404 })
      );
    } catch (err: any) {
      console.error("[CredentialService Error]", err);
      return addCorsHeaders(
        Response.json({ success: false, message: err?.message || "Internal server error" }, { status: 500 })
      );
    }
  },
});

console.log(`Credential Service running on http://${server.hostname}:${server.port}`);
