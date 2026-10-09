import dotenv from "dotenv";
dotenv.config();

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  return value;
};

const optionalEnv = <T>(key: string, defaultValue: T): string | T => {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
};

const parseCorsOrigins = (value: string): string[] => {
  return value
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
};

export const env = {
  port: Number(optionalEnv("PORT", 3002)),
  corsOrigins: parseCorsOrigins(requiredEnv("CORS_ORIGINS")),
  jwtSecret: requiredEnv("JWT_SECRET"),
  masterEncryptionKey: requiredEnv("MASTER_ENCRYPTION_KEY"),
  internalServiceSecret: requiredEnv("INTERNAL_SERVICE_SECRET"),
};
