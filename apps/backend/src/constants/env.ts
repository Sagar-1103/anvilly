import dotenv from "dotenv";
dotenv.config();

const requiredEnv = (key: string) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable - ${key} not defined`);
    }
    return value;
}

const optionalEnv = <T>(key: string, defaultValue:T): string | T => {
    const value = process.env[key];
    return value || defaultValue;
}

export const env = {
    port: optionalEnv("PORT",3001) as number,
    corsOrigin: requiredEnv("CORS_ORIGIN"),
    jwtSecret: requiredEnv("JWT_SECRET"),
    geminiApiKey: requiredEnv("GEMINI_API_KEY"),
    e2bApiKey: requiredEnv("E2B_API_KEY"),
    sandboxTimeoutMs: optionalEnv("SANDBOX_TIMEOUT_MS",4 * 1000 * 60) as number
}