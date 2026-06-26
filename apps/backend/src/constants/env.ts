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
    port: optionalEnv("PORT",3000),
    cors_origin: requiredEnv("CORS_ORIGIN")
}