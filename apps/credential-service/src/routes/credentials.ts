import { prisma } from "@repo/db/client";
import { z } from "zod";
import { env } from "../config/env";
import { encryptSecret, createMaskedPreview } from "../crypto/cipher";
import { isValidProvider, validateApiKeyFormat, PROVIDER_PRESETS, type SupportedProvider } from "../crypto/validator";

const postCredentialSchema = z.object({
  provider: z.string().min(1, "Provider is required"),
  apiKey: z.string().min(8, "API key must be at least 8 characters"),
  label: z.string().max(100).optional(),
  model: z.string().max(120).optional(),
});

// Get masked credentials for user
export async function handleGetCredentials(userId: string): Promise<Response> {
  const credentials = await prisma.userApiKey.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      model: true,
      label: true,
      keyPreview: true,
      isActive: true,
      createdAt: true,
      lastUsedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({
    success: true,
    credentials,
  });
}

// Save or update encrypted user key
export async function handlePostCredential(req: Request, userId: string): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const parseResult = postCredentialSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      {
        success: false,
        message: parseResult.error.issues[0]?.message || "Validation failed",
      },
      { status: 400 }
    );
  }

  const { provider, apiKey, label, model } = parseResult.data;
  const normalizedProvider = provider.toLowerCase().trim();

  if (!isValidProvider(normalizedProvider)) {
    return Response.json(
      { success: false, message: `Unsupported provider: ${normalizedProvider}` },
      { status: 400 }
    );
  }

  const validation = validateApiKeyFormat(normalizedProvider, apiKey);
  if (!validation.valid) {
    return Response.json(
      { success: false, message: validation.error || "Invalid API key format" },
      { status: 400 }
    );
  }

  const defaultPresetModel =
    PROVIDER_PRESETS[normalizedProvider as SupportedProvider]?.defaultModel || "gpt-4o";
  const activeModel = model?.trim() || defaultPresetModel;

  const encrypted = encryptSecret(apiKey.trim(), env.masterEncryptionKey);
  const keyPreview = createMaskedPreview(apiKey.trim());

  const record = await prisma.userApiKey.upsert({
    where: {
      userId_provider: {
        userId,
        provider: normalizedProvider,
      },
    },
    update: {
      model: activeModel,
      label: label?.trim() || null,
      keyPreview,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyVersion: encrypted.keyVersion,
      isActive: true,
      updatedAt: new Date(),
    },
    create: {
      userId,
      provider: normalizedProvider,
      model: activeModel,
      label: label?.trim() || null,
      keyPreview,
      ciphertext: encrypted.ciphertext,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      keyVersion: encrypted.keyVersion,
    },
    select: {
      id: true,
      provider: true,
      model: true,
      label: true,
      keyPreview: true,
      isActive: true,
      createdAt: true,
      lastUsedAt: true,
    },
  });

  return Response.json(
    {
      success: true,
      message: "Credential encrypted and stored securely",
      credential: record,
    },
    { status: 201 }
  );
}

// Delete user credential
export async function handleDeleteCredential(userId: string, credentialId: string): Promise<Response> {
  const existing = await prisma.userApiKey.findFirst({
    where: { id: credentialId, userId },
  });

  if (!existing) {
    return Response.json({ success: false, message: "Credential not found" }, { status: 404 });
  }

  await prisma.userApiKey.delete({
    where: { id: credentialId },
  });

  return Response.json({
    success: true,
    message: "Credential removed successfully",
  });
}
