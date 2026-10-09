import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { env } from "../config/env";

interface TokenPayload {
  id?: string;
  userId?: string;
  email?: string;
}

// Verify user JWT from Bearer header
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
  } catch (err: any) {
    console.warn(`[Auth] JWT verify failed: ${err?.message}`);
    return null;
  }
}

// Verify internal secret between services
export function verifyInternalSecret(req: Request): boolean {
  const headerSecret = req.headers.get("x-internal-secret");
  if (!headerSecret) return false;

  const expectedBuffer = Buffer.from(env.internalServiceSecret);
  const receivedBuffer = Buffer.from(headerSecret);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
