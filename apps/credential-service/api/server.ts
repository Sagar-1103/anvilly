import app from "../src/app";
import { env } from "../src/config/env";

const server = Bun.serve({
  port: env.PORT,
  async fetch(req: Request) {
    const res = await app.handle(req);
    if (res) return res;

    return new Response(JSON.stringify({ success: false, message: "Route not found" }), {
      status: 404,
      headers: {
        "Access-Control-Allow-Origin": env.CORS_ORIGIN,
        "Content-Type": "application/json",
      },
    });
  },
});

console.log(`Server running in ${env.NODE_ENV} mode on port ${server.port}`);
