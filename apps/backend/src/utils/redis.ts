import { createClient } from "redis";
import { env } from "../constants/env";
import type { Message } from "./types";
import type { CompactedStatePayload } from "./compaction";

export const redisClient = createClient({
    url: env.redisUrl,
});

redisClient.on("error", (error) => {
    console.error("REDIS ERROR:", error);
});

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};

// Keys
const ACTIVE_SESSION_PREFIX = "session:active:";
const STATE_CACHE_PREFIX = "cache:state:";
const CHAT_CACHE_PREFIX = "cache:chat:";
const AGENT_LOCK_PREFIX = "lock:agent:";

const SESSION_TTL_SECONDS = 15 * 60; // 15 mins
const STATE_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const CHAT_CACHE_TTL_SECONDS = 60 * 60; // 1 hour
const LOCK_TTL_SECONDS = 2 * 60; // 2 mins

// Agent state cache
export const getAgentStateCache = async (userId: string, projectId: string): Promise<CompactedStatePayload | null> => {
    try {
        const key = `${STATE_CACHE_PREFIX}${userId}:${projectId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("REDIS GET AGENT STATE ERROR:", error);
        return null;
    }
};

export const setAgentStateCache = async (
    userId: string,
    projectId: string,
    state: CompactedStatePayload
): Promise<void> => {
    try {
        const key = `${STATE_CACHE_PREFIX}${userId}:${projectId}`;
        await redisClient.set(key, JSON.stringify(state), {
            expiration: { type: "EX", value: STATE_CACHE_TTL_SECONDS }
        });
    } catch (error) {
        console.error("REDIS SET AGENT STATE ERROR:", error);
    }
};

export const invalidateAgentState = async (userId: string, projectId: string): Promise<void> => {
    try {
        const key = `${STATE_CACHE_PREFIX}${userId}:${projectId}`;
        await redisClient.del(key);
    } catch (error) {
        console.error("REDIS INVALIDATE AGENT STATE ERROR:", error);
    }
};

// Client chat cache
export const getChatCache = async (userId: string, projectId: string): Promise<Message[] | null> => {
    try {
        const key = `${CHAT_CACHE_PREFIX}${userId}:${projectId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("REDIS GET CHAT CACHE ERROR:", error);
        return null;
    }
};

export const setChatCache = async (userId: string, projectId: string, messages: Message[]): Promise<void> => {
    try {
        const key = `${CHAT_CACHE_PREFIX}${userId}:${projectId}`;
        await redisClient.set(key, JSON.stringify(messages), {
            expiration: { type: "EX", value: CHAT_CACHE_TTL_SECONDS }
        });
    } catch (error) {
        console.error("REDIS SET CHAT CACHE ERROR:", error);
    }
};

export const invalidateChatCache = async (userId: string, projectId: string): Promise<void> => {
    try {
        const key = `${CHAT_CACHE_PREFIX}${userId}:${projectId}`;
        await redisClient.del(key);
    } catch (error) {
        console.error("REDIS INVALIDATE CHAT CACHE ERROR:", error);
    }
};

// Active session scratchpad
export interface ActiveSessionData {
    turnStartedAt: number;
    userPrompt: string;
    inFlightTools?: any[];
    pendingQuestion?: any;
    updatedAt: number;
}

export const saveActiveSession = async (
    userId: string,
    projectId: string,
    sessionData: Partial<ActiveSessionData>
): Promise<void> => {
    try {
        const key = `${ACTIVE_SESSION_PREFIX}${userId}:${projectId}`;
        const data: ActiveSessionData = {
            turnStartedAt: sessionData.turnStartedAt || Date.now(),
            userPrompt: sessionData.userPrompt || "",
            inFlightTools: sessionData.inFlightTools || [],
            pendingQuestion: sessionData.pendingQuestion !== undefined ? sessionData.pendingQuestion : null,
            updatedAt: Date.now(),
        };
        await redisClient.set(key, JSON.stringify(data), {
            expiration: { type: "EX", value: SESSION_TTL_SECONDS }
        });
    } catch (error) {
        console.error("REDIS SAVE ACTIVE SESSION ERROR:", error);
    }
};

export const getActiveSession = async (userId: string, projectId: string): Promise<ActiveSessionData | null> => {
    try {
        const key = `${ACTIVE_SESSION_PREFIX}${userId}:${projectId}`;
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("REDIS GET ACTIVE SESSION ERROR:", error);
        return null;
    }
};

export const clearActiveSession = async (userId: string, projectId: string): Promise<void> => {
    try {
        const key = `${ACTIVE_SESSION_PREFIX}${userId}:${projectId}`;
        await redisClient.del(key);
    } catch (error) {
        console.error("REDIS CLEAR ACTIVE SESSION ERROR:", error);
    }
};

// Concurrency lock
export const acquireAgentLock = async (userId: string, projectId: string): Promise<boolean> => {
    try {
        const key = `${AGENT_LOCK_PREFIX}${userId}:${projectId}`;
        const result = await redisClient.set(key, String(Date.now()), {
            condition: "NX",
            expiration: { type: "EX", value: LOCK_TTL_SECONDS }
        });
        return result === "OK";
    } catch (error) {
        console.error("REDIS ACQUIRE LOCK ERROR:", error);
        return true;
    }
};

export const releaseAgentLock = async (userId: string, projectId: string): Promise<void> => {
    try {
        const key = `${AGENT_LOCK_PREFIX}${userId}:${projectId}`;
        await redisClient.del(key);
    } catch (error) {
        console.error("REDIS RELEASE LOCK ERROR:", error);
    }
};