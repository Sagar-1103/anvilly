import { Router } from "./lib/router";
import { handleHealth } from "./routes/health";
import {
  handleGetCredentials,
  handlePostCredential,
  handleDeleteCredential,
} from "./routes/credentials";
import { handleResolveCredential } from "./routes/resolve";
import { authenticateUser, verifyInternalSecret } from "./middleware/auth";

const app = new Router();

// Health check routes
app.get("/health", () => handleHealth());
app.get("/api/health", () => handleHealth());

// User credentials routes
app.get("/api/v1/credentials", async (req: Request) => {
  const userId = authenticateUser(req);
  if (!userId) {
    return Response.json(
      { success: false, message: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }
  return handleGetCredentials(userId);
});

app.post("/api/v1/credentials", async (req: Request) => {
  const userId = authenticateUser(req);
  if (!userId) {
    return Response.json(
      { success: false, message: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }
  return handlePostCredential(req, userId);
});

app.delete("/api/v1/credentials/:id", async (req: Request, params?: any) => {
  const userId = authenticateUser(req);
  if (!userId) {
    return Response.json(
      { success: false, message: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }
  const credentialId = params?.id;
  if (!credentialId) {
    return Response.json(
      { success: false, message: "Missing credential ID" },
      { status: 400 }
    );
  }
  return handleDeleteCredential(userId, credentialId);
});

// Internal resolution route
app.post("/api/v1/credentials/resolve", async (req: Request) => {
  if (!verifyInternalSecret(req)) {
    return Response.json(
      { success: false, message: "Forbidden: Invalid internal secret" },
      { status: 403 }
    );
  }
  return handleResolveCredential(req);
});

export default app;
