import { Router } from "./lib/router";
import appRouter from "./routes";

const app = new Router();

// Health
app.get("/health", () => Response.json({ success: true }));
app.get("/api/health", () => Response.json({ success: true }));

// API
app.use("/api", appRouter);

export default app;
