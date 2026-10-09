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

export const env = {
  port: Number(optionalEnv("PORT", 3002)),
  corsOrigin: optionalEnv("CORS_ORIGIN", "*") as string,
  jwtSecret: requiredEnv("JWT_SECRET"),
  masterEncryptionKey: requiredEnv("MASTER_ENCRYPTION_KEY"),
  internalServiceSecret: requiredEnv("INTERNAL_SERVICE_SECRET"),
};
