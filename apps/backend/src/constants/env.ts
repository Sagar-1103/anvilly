import dotenv from "dotenv";
dotenv.config();

const requiredEnv = (key: string) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable - ${key} not defined`);
    }
    return value;
}

const optionalEnv = <T>(key: string, defaultValue: T): string | T => {
    const value = process.env[key];
    return value || defaultValue;
}

const optionalNumberEnv = (key: string, defaultValue: number): number => {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

export const env = {
    port: optionalNumberEnv("PORT", 3001),
    corsOrigin: requiredEnv("CORS_ORIGIN"),
    jwtSecret: requiredEnv("JWT_SECRET"),
    e2bApiKey: requiredEnv("E2B_API_KEY"),
    sandboxTimeoutMs: optionalNumberEnv("SANDBOX_TIMEOUT_MS", 4 * 1000 * 60),
    redisUrl: requiredEnv("REDIS_URL"),
    sessionTtlSeconds: optionalNumberEnv("SESSION_TTL_SECONDS", 15 * 60), // 15 mins
    stateCacheTtlSeconds: optionalNumberEnv("STATE_CACHE_TTL_SECONDS", 7 * 24 * 60 * 60), // 7 days
    chatCacheTtlSeconds: optionalNumberEnv("CHAT_CACHE_TTL_SECONDS", 60 * 60), // 1 hour
    lockTtlSeconds: optionalNumberEnv("LOCK_TTL_SECONDS", 2 * 60), // 2 mins
    credentialServiceUrl: requiredEnv("CREDENTIAL_SERVICE_URL"),
    internalServiceSecret: requiredEnv("INTERNAL_SERVICE_SECRET"),
}