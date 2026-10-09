import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits auth tag
export const CURRENT_KEY_VERSION = 1;

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: number;
}

// Encrypt secret with AES-256-GCM
export function encryptSecret(plaintext: string, masterKeyHex: string): EncryptedPayload {
  const masterKey = Buffer.from(masterKeyHex, "hex");
  if (masterKey.length !== 32) {
    throw new Error("MASTER_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    keyVersion: CURRENT_KEY_VERSION,
  };
}

// Decrypt secret with AES-256-GCM
export function decryptSecret(payload: EncryptedPayload, masterKeyHex: string): string {
  const masterKey = Buffer.from(masterKeyHex, "hex");
  if (masterKey.length !== 32) {
    throw new Error("MASTER_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)");
  }

  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

// Mask key for UI display (e.g. sk-c545...9a59)
export function createMaskedPreview(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 8) {
    return "••••••••";
  }
  const prefixLength = Math.min(7, Math.floor(trimmed.length / 4));
  const suffixLength = 4;
  const start = trimmed.slice(0, prefixLength);
  const end = trimmed.slice(-suffixLength);
  return `${start}...${end}`;
}
