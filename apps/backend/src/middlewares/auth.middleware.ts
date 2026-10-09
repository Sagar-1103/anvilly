import jwt from "jsonwebtoken";
import { env } from "../constants/env";

interface TokenPayload {
  id?: string;
  userId?: string;
  email?: string;
}

// Verify token
export function authenticateUser(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== "bearer") {
    return null;
  }

  const token = parts[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenPayload;
    return decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
}

// Auth guard
export function requireAuth(
  handler: (
    req: Request,
    params: Record<string, string>,
    userId?: string
  ) => Promise<Response> | Response
) {
  return async (req: Request, params: Record<string, string>) => {
    const userId = authenticateUser(req);
    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized: Invalid or missing token" },
        { status: 401 }
      );
    }
    (req as any).userId = userId;
    return handler(req, params, userId);
  };
}