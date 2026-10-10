import { prisma } from "@repo/db";
import { z } from "zod";
import { env } from "../config/env";
import { encryptSecret, decryptSecret, createMaskedPreview } from "../crypto/cipher";

const postExpoTokenSchema = z.object({
  token: z.string().min(10, "Expo access token must be at least 10 characters"),
});

const resolveExpoTokenSchema = z.object({
  userId: z.string().uuid("Invalid userId"),
});

/**
 * Get masked Expo Token status for a user
 */
export async function handleGetExpoToken(userId: string): Promise<Response> {
  try {
    const record = await (prisma as any).expoToken.findUnique({
      where: { userId },
      select: {
        id: true,
        username: true,
        tokenPreview: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return Response.json({
      success: true,
      expoToken: record || null,
    });
  } catch (error: any) {
    console.error("[handleGetExpoToken] Error:", error);
    return Response.json(
      { success: false, message: error?.message || "Failed to retrieve Expo token" },
      { status: 500 }
    );
  }
}

/**
 * Validate against Expo API, encrypt, and store Expo Access Token
 */
export async function handlePostExpoToken(req: Request, userId: string): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = postExpoTokenSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      {
        success: false,
        message: parseResult.error.issues[0]?.message || "Validation failed",
      },
      { status: 400 }
    );
  }

  let sanitizedToken = parseResult.data.token.trim();
  // Strip common prefixes and quotes that users often inadvertently paste
  sanitizedToken = sanitizedToken
    .replace(/^EXPO_TOKEN\s*=\s*/i, "")
    .replace(/^Bearer\s+/i, "")
    .replace(/^["']|["']$/g, "")
    .trim();

  if (sanitizedToken.startsWith("ExponentPushToken") || sanitizedToken.startsWith("ExpoPushToken")) {
    return Response.json(
      {
        success: false,
        message:
          "This looks like an Expo Push Token, not an Access Token. Please generate an Access Token at expo.dev/settings/access-tokens.",
      },
      { status: 400 }
    );
  }

  if (sanitizedToken.length < 10) {
    return Response.json(
      {
        success: false,
        message: "Expo Access Token must be at least 10 characters.",
      },
      { status: 400 }
    );
  }

  // Validate token directly with Expo's public GraphQL API
  let expoUsername = "expo-user";
  try {
    const expoRes = await fetch("https://api.expo.dev/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sanitizedToken}`,
      },
      body: JSON.stringify({
        query: `query VerifyExpoToken {
          meUserActor {
            id
            username
            accounts {
              id
              name
            }
          }
        }`,
      }),
    });

    if (!expoRes.ok) {
      const errText = await expoRes.text().catch(() => "");
      console.warn(`[handlePostExpoToken] Expo API rejected token (status ${expoRes.status}):`, errText);
      let errMsg =
        "Invalid Expo Access Token. Please verify your token at expo.dev/settings/access-tokens.";
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.errors?.[0]?.message) {
          errMsg = parsed.errors[0].message;
        } else if (parsed?.message) {
          errMsg = parsed.message;
        }
      } catch {}
      return Response.json({ success: false, message: errMsg }, { status: 400 });
    }

    const expoData = (await expoRes.json()) as any;
    if (expoData?.errors?.length) {
      const errMsg = expoData.errors[0]?.message || "Invalid Expo Access Token";
      return Response.json({ success: false, message: errMsg }, { status: 400 });
    }

    const userActor = expoData?.data?.meUserActor;
    if (!userActor) {
      return Response.json(
        {
          success: false,
          message: "Invalid Expo Access Token: No user account found for this token.",
        },
        { status: 400 }
      );
    }

    expoUsername =
      userActor.username ||
      userActor.accounts?.[0]?.name ||
      "expo-user";
  } catch (err: any) {
    console.error("[handlePostExpoToken] Failed to verify with Expo API:", err);
    return Response.json(
      {
        success: false,
        message: "Failed to connect to Expo API. Please check your network or try again.",
      },
      { status: 502 }
    );
  }

  try {
    const encrypted = encryptSecret(sanitizedToken, env.masterEncryptionKey);
    const tokenPreview = createMaskedPreview(sanitizedToken);

    const record = await (prisma as any).expoToken.upsert({
      where: { userId },
      update: {
        username: expoUsername,
        tokenPreview,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: encrypted.keyVersion,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId,
        username: expoUsername,
        tokenPreview,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: encrypted.keyVersion,
      },
      select: {
        id: true,
        username: true,
        tokenPreview: true,
        isActive: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        message: `Successfully connected Expo account @${expoUsername}`,
        expoToken: record,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[handlePostExpoToken] Error saving token:", error);
    return Response.json(
      { success: false, message: error?.message || "Failed to store Expo token securely" },
      { status: 500 }
    );
  }
}

/**
 * Delete user's Expo Token
 */
export async function handleDeleteExpoToken(userId: string): Promise<Response> {
  try {
    await (prisma as any).expoToken.deleteMany({
      where: { userId },
    });

    return Response.json({
      success: true,
      message: "Expo Access Token disconnected successfully",
    });
  } catch (error: any) {
    console.error("[handleDeleteExpoToken] Error:", error);
    return Response.json(
      { success: false, message: error?.message || "Failed to disconnect Expo token" },
      { status: 500 }
    );
  }
}

/**
 * Internal-only endpoint to resolve & decrypt the user's Expo Access Token
 */
export async function handleResolveExpoToken(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = resolveExpoTokenSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      { success: false, message: parseResult.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    );
  }

  const { userId } = parseResult.data;

  try {
    const record = await (prisma as any).expoToken.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!record) {
      return Response.json(
        { success: false, message: "No active Expo Access Token found for this user" },
        { status: 404 }
      );
    }

    const decryptedToken = decryptSecret(
      {
        ciphertext: record.ciphertext,
        iv: record.iv,
        authTag: record.authTag,
        keyVersion: record.keyVersion,
      },
      env.masterEncryptionKey
    );

    // Update lastUsedAt in background
    (prisma as any).expoToken
      .update({
        where: { id: record.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((e: any) => console.warn("[ExpoToken] Failed to update lastUsedAt:", e?.message));

    return Response.json({
      success: true,
      token: decryptedToken,
      username: record.username,
      keyPreview: record.tokenPreview,
    });
  } catch (error: any) {
    console.error("[handleResolveExpoToken] Decryption error:", error);
    return Response.json(
      { success: false, message: "Failed to decrypt Expo token" },
      { status: 500 }
    );
  }
}
