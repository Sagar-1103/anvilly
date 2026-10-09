import app from "../src/app";
import { env } from "../src/config/env";
import { getCorsHeaders } from "../src/lib/cors";

const server = Bun.serve({
  port: env.port,
  async fetch(req: Request) {
    const res = await app.handle(req);
    if (res) return res;

    return new Response(JSON.stringify({ success: false, message: "Route not found" }), {
      status: 404,
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/json",
      },
    });
  },
});

console.log(`Server running on port ${server.port}`);
