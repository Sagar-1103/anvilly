"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ApiKeyModal from "@/components/shared/ApiKeyModal";
import AuthModal from "@/components/landing/AuthModal";

export interface CredentialItem {
  id: string;
  provider: string;
  model: string | null;
  label: string | null;
  keyPreview: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export const PROVIDER_MODELS: Record<
  string,
  Array<{ id: string; name: string; isDefault?: boolean }>
> = {
  openai: [
    { id: "gpt-4o", name: "GPT-4o (Flagship)", isDefault: true },
    { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Cheap)" },
    { id: "o3-mini", name: "o3-mini (Reasoning)" },
  ],
  deepseek: [
    { id: "deepseek-chat", name: "DeepSeek-V3 (Chat)", isDefault: true },
    { id: "deepseek-flash", name: "DeepSeek Flash" },
    { id: "deepseek-reasoner", name: "DeepSeek-R1 (Reasoning)" },
  ],
  openrouter: [
    { id: "deepseek/deepseek-chat", name: "DeepSeek V3", isDefault: true },
    { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5" },
    { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" },
  ],
};

export const PROVIDER_DISPLAY_INFO: Record<
  string,
  { name: string; defaultModel: string; badgeClass: string }
> = {
  openai: {
    name: "OpenAI",
    defaultModel: "gpt-4o",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  deepseek: {
    name: "DeepSeek",
    defaultModel: "deepseek-chat",
    badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  openrouter: {
    name: "OpenRouter",
    defaultModel: "deepseek/deepseek-chat",
    badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
};

interface CredentialContextType {
  credentials: CredentialItem[];
  selectedCredentialId: string | null;
  setSelectedCredentialId: (id: string | null) => void;
  activeCredential: CredentialItem | null;
  activeModel: string;
  setActiveModel: (model: string) => void;
  hasModel: boolean;
  isLoading: boolean;
  isModalOpen: boolean;
  isAuthModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  refetchCredentials: (force?: boolean) => Promise<void>;
  addOrUpdateCredential: (item: CredentialItem) => void;
  removeCredential: (id: string) => void;
}

const CredentialContext = createContext<CredentialContextType | undefined>(undefined);

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minute cache

let inMemoryCache: {
  userId: string;
  timestamp: number;
  data: CredentialItem[];
} | null = null;

let activeFetchPromise: Promise<CredentialItem[]> | null = null;

const CACHE_KEY = "anvilly_credentials_cache";

function getCachedData(userId: string): CredentialItem[] | null {
  if (inMemoryCache && inMemoryCache.userId === userId) {
    if (Date.now() - inMemoryCache.timestamp < CACHE_TTL_MS) {
      return inMemoryCache.data;
    }
  }
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.userId === userId && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          inMemoryCache = parsed;
          return parsed.data;
        }
      }
    } catch {}
  }
  return null;
}

function setCachedData(userId: string, data: CredentialItem[]) {
  const entry = { userId, timestamp: Date.now(), data };
  inMemoryCache = entry;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {}
  }
}

function clearCachedData() {
  inMemoryCache = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {}
  }
}

const SELECTED_CRED_KEY = "anvilly_selected_cred_id";
const PROVIDER_MODELS_KEY = "anvilly_provider_models";

function getStoredCredentialId(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${SELECTED_CRED_KEY}_${userId}`);
  } catch {
    return null;
  }
}

function setStoredCredentialId(userId: string, id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) {
      localStorage.setItem(`${SELECTED_CRED_KEY}_${userId}`, id);
    } else {
      localStorage.removeItem(`${SELECTED_CRED_KEY}_${userId}`);
    }
  } catch {}
}

function getStoredProviderModels(userId: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${PROVIDER_MODELS_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStoredProviderModel(userId: string, key: string, model: string) {
  if (typeof window === "undefined") return;
  try {
    const map = getStoredProviderModels(userId);
    map[key] = model;
    localStorage.setItem(`${PROVIDER_MODELS_KEY}_${userId}`, JSON.stringify(map));
  } catch {}
}

function resolveSelection(
  list: CredentialItem[],
  userId: string | null,
  currentCredId?: string | null
): { credId: string | null; model: string | null } {
  if (!list.length) {
    return { credId: null, model: null };
  }

  const storedId = userId ? getStoredCredentialId(userId) : null;
  const target =
    (currentCredId && list.find((c) => c.id === currentCredId)) ||
    (storedId && list.find((c) => c.id === storedId)) ||
    list[0]!;

  const storedModels = userId ? getStoredProviderModels(userId) : {};
  const preferredModel =
    storedModels[target.id] ||
    storedModels[target.provider] ||
    target.model ||
    PROVIDER_DISPLAY_INFO[target.provider]?.defaultModel ||
    null;

  return {
    credId: target.id,
    model: preferredModel,
  };
}

export function CredentialProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const userId = (session?.user as any)?.id || session?.user?.email || null;

  const [credentials, setCredentials] = useState<CredentialItem[]>(() => {
    return inMemoryCache ? inMemoryCache.data : [];
  });
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchCredentials = useCallback(
    async (force = false) => {
      // Do nothing while auth session is initializing
      if (status === "loading") {
        return;
      }

      // Not authenticated: clear credentials and cache
      if (status !== "authenticated" || !userId) {
        setCredentials([]);
        setSelectedCredentialId(null);
        setSelectedModel(null);
        clearCachedData();
        return;
      }

      // 1. Return fresh cache if available and not forced
      if (!force) {
        const cached = getCachedData(userId);
        if (cached) {
          setCredentials(cached);
          const sel = resolveSelection(cached, userId, selectedCredentialId);
          if (sel.credId) {
            setSelectedCredentialId(sel.credId);
            setStoredCredentialId(userId, sel.credId);
          }
          if (sel.model) {
            setSelectedModel(sel.model);
          }
          return;
        }
      }

      // 2. Request deduplication: reuse active in-flight request
      if (activeFetchPromise) {
        try {
          const data = await activeFetchPromise;
          setCredentials(data);
          const sel = resolveSelection(data, userId, selectedCredentialId);
          if (sel.credId) {
            setSelectedCredentialId(sel.credId);
            setStoredCredentialId(userId, sel.credId);
          }
          if (sel.model) {
            setSelectedModel(sel.model);
          }
        } catch {
          // Handled in original fetch
        }
        return;
      }

      setIsLoading(true);

      activeFetchPromise = (async () => {
        try {
          const res = await fetch("/api/user/credentials");
          const data = await res.json();
          if (data.success && Array.isArray(data.credentials)) {
            setCachedData(userId, data.credentials);
            return data.credentials as CredentialItem[];
          }
          return [] as CredentialItem[];
        } catch (err) {
          console.error("[CredentialContext] Failed to load credentials:", err);
          return [] as CredentialItem[];
        } finally {
          activeFetchPromise = null;
          setIsLoading(false);
        }
      })();

      const result = await activeFetchPromise;
      setCredentials(result);

      const sel = resolveSelection(result, userId, selectedCredentialId);
      if (sel.credId) {
        setSelectedCredentialId(sel.credId);
        setStoredCredentialId(userId, sel.credId);
      }
      if (sel.model) {
        setSelectedModel(sel.model);
      }
    },
    [status, userId, selectedCredentialId]
  );

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const addOrUpdateCredential = useCallback(
    (item: CredentialItem) => {
      setCredentials((prev) => {
        const idx = prev.findIndex((c) => c.id === item.id);
        let updated: CredentialItem[];
        if (idx >= 0) {
          updated = [...prev];
          updated[idx] = item;
        } else {
          updated = [item, ...prev];
        }
        if (userId) {
          setCachedData(userId, updated);
        }
        return updated;
      });

      setSelectedCredentialId(item.id);
      if (userId) {
        setStoredCredentialId(userId, item.id);
      }
      const modelToSet =
        item.model || PROVIDER_DISPLAY_INFO[item.provider]?.defaultModel || null;
      if (modelToSet) {
        setSelectedModel(modelToSet);
        if (userId) {
          setStoredProviderModel(userId, item.provider, modelToSet);
          setStoredProviderModel(userId, item.id, modelToSet);
        }
      }
    },
    [userId]
  );

  const removeCredential = useCallback(
    (id: string) => {
      setCredentials((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        if (userId) {
          setCachedData(userId, updated);
        }
        return updated;
      });

      setSelectedCredentialId((prevId) => {
        if (prevId === id) {
          if (userId) setStoredCredentialId(userId, null);
          return null;
        }
        return prevId;
      });
    },
    [userId]
  );

  const activeCredential =
    credentials.find((c) => c.id === selectedCredentialId) || credentials[0] || null;

  const handleSelectCredential = useCallback(
    (id: string | null) => {
      setSelectedCredentialId(id);
      if (userId) {
        setStoredCredentialId(userId, id);
      }

      if (!id) {
        setSelectedModel(null);
        return;
      }

      const target = credentials.find((c) => c.id === id);
      if (!target) return;

      const storedModels = userId ? getStoredProviderModels(userId) : {};
      const preferredModel =
        storedModels[target.id] ||
        storedModels[target.provider] ||
        target.model ||
        PROVIDER_DISPLAY_INFO[target.provider]?.defaultModel ||
        null;

      setSelectedModel(preferredModel);
    },
    [credentials, userId]
  );

  const handleSetActiveModel = useCallback(
    (model: string) => {
      const cleanModel = model.trim();
      if (!cleanModel) return;

      setSelectedModel(cleanModel);

      if (activeCredential && userId) {
        setStoredProviderModel(userId, activeCredential.provider, cleanModel);
        setStoredProviderModel(userId, activeCredential.id, cleanModel);

        setCredentials((prev) => {
          const updated = prev.map((c) =>
            c.id === activeCredential.id ? { ...c, model: cleanModel } : c
          );
          setCachedData(userId, updated);
          return updated;
        });
      }
    },
    [activeCredential, userId]
  );

  const activeModel =
    selectedModel ||
    activeCredential?.model ||
    (activeCredential
      ? PROVIDER_DISPLAY_INFO[activeCredential.provider]?.defaultModel || "gpt-4o"
      : "");

  const hasModel = Boolean(activeCredential && activeModel);

  const openModal = useCallback(() => {
    if (status !== "authenticated") {
      setIsAuthModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  }, [status]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  return (
    <CredentialContext.Provider
      value={{
        credentials,
        selectedCredentialId: activeCredential?.id || null,
        setSelectedCredentialId: handleSelectCredential,
        activeCredential,
        activeModel,
        setActiveModel: handleSetActiveModel,
        hasModel,
        isLoading,
        isModalOpen,
        isAuthModalOpen,
        openModal,
        closeModal,
        openAuthModal,
        closeAuthModal,
        refetchCredentials: fetchCredentials,
        addOrUpdateCredential,
        removeCredential,
      }}
    >
      {children}
      {status === "authenticated" && (
        <ApiKeyModal
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />
    </CredentialContext.Provider>
  );
}

export function useCredentials() {
  const context = useContext(CredentialContext);
  if (!context) {
    throw new Error("useCredentials must be used within a CredentialProvider");
  }
  return context;
}
