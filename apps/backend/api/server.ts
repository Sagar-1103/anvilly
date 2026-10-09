import app from "../src/app";
import { env } from "../src/constants/env";
import { connectRedis } from "../src/utils/redis";

// Connect Redis
connectRedis().catch((err) => {
  console.error("Redis connection error on startup:", err);
});

const server = Bun.serve({
  port: env.port,
  async fetch(req: Request) {
    const res = await app.handle(req);
    if (res) return res;

    return new Response(
      JSON.stringify({ success: false, message: "Route not found" }),
      {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": env.corsOrigin,
          "Content-Type": "application/json",
        },
      }
    );
  },
});

console.log(`Server running on port ${server.port}`);
