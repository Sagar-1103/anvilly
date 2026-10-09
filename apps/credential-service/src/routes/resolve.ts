import { prisma } from "@repo/db";
import { z } from "zod";
import { env } from "../config/env";
import { decryptSecret } from "../crypto/cipher";
import { PROVIDER_PRESETS, type SupportedProvider } from "../crypto/validator";

const resolveSchema = z
  .object({
    userId: z.string().uuid("Invalid userId"),
    credentialId: z.string().uuid("Invalid credentialId").optional(),
    provider: z.string().optional(),
  })
  .refine((data) => data.credentialId || data.provider, {
    message: "Either credentialId or provider must be specified",
  });

// Resolve and decrypt key for backend use
export async function handleResolveCredential(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = resolveSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      {
        success: false,
        message: parseResult.error.issues[0]?.message || "Validation failed",
      },
      { status: 400 }
    );
  }

  const { userId, credentialId, provider } = parseResult.data;

  let record = null;
  if (credentialId) {
    record = await prisma.userApiKey.findFirst({
      where: {
        id: credentialId,
        userId,
        isActive: true,
      },
    });
  } else if (provider) {
    const normalizedProvider = provider.toLowerCase().trim();
    record = await prisma.userApiKey.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: normalizedProvider,
        },
      },
    });
  }

  if (!record || !record.isActive) {
    return Response.json(
      {
        success: false,
        message: `No active credential found for ${credentialId || provider}`,
      },
      { status: 404 }
    );
  }

  try {
    const decryptedKey = decryptSecret(
      {
        ciphertext: record.ciphertext,
        iv: record.iv,
        authTag: record.authTag,
        keyVersion: record.keyVersion,
      },
      env.masterEncryptionKey
    );

    const preset = PROVIDER_PRESETS[record.provider as SupportedProvider] || {
      name: record.provider,
      baseURL: "https://api.openai.com/v1",
      defaultModel: "gpt-4o",
    };

    // Track last used timestamp
    prisma.userApiKey
      .update({
        where: { id: record.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((err) => console.error("[Resolve] Failed to update lastUsedAt:", err));

    return Response.json({
      success: true,
      id: record.id,
      provider: record.provider,
      apiKey: decryptedKey,
      baseURL: preset.baseURL,
      defaultModel: record.model || preset.defaultModel,
      keyPreview: record.keyPreview,
    });
  } catch (err) {
    console.error("[Resolve] Decryption failure:", err);
    return Response.json(
      { success: false, message: "Decryption error or corrupted credential" },
      { status: 500 }
    );
  }
}
