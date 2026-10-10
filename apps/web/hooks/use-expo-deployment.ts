"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";

export interface ExpoTokenInfo {
  id: string;
  username: string | null;
  tokenPreview: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface ProjectBuildInfo {
  id: string;
  projectId: string;
  platform: "ANDROID" | "IOS";
  buildType: "APK" | "AAB";
  profile: "PREVIEW" | "PRODUCTION" | "DEVELOPMENT";
  status: "QUEUED" | "IN_PROGRESS" | "FINISHED" | "ERRORED" | "CANCELED";
  expoBuildId: string | null;
  expoBuildUrl: string | null;
  artifactUrl: string | null;
  errorDetails: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UseExpoDeploymentOptions {
  enabled?: boolean;
  pollIntervalMs?: number;
}

export function useExpoDeployment(
  projectId?: string,
  options?: UseExpoDeploymentOptions
) {
  const enabled = options?.enabled ?? true;
  const pollIntervalMs = options?.pollIntervalMs ?? 120_000; // 2 minutes

  const { data: session } = useSession();
  const [expoToken, setExpoToken] = useState<ExpoTokenInfo | null>(null);
  const [loadingToken, setLoadingToken] = useState(false);
  const [savingToken, setSavingToken] = useState(false);

  const [builds, setBuilds] = useState<ProjectBuildInfo[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingBuilds, setLoadingBuilds] = useState(false);
  const [triggeringBuild, setTriggeringBuild] = useState(false);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch user Expo Token
  const fetchExpoToken = useCallback(async () => {
    setLoadingToken(true);
    try {
      const res = await fetch("/api/user/expo-token");
      const data = await res.json();
      if (data.success) {
        setExpoToken(data.expoToken || null);
      }
    } catch (err) {
      console.error("[useExpoDeployment] Failed to fetch token:", err);
    } finally {
      setLoadingToken(false);
    }
  }, []);

  // 2. Save Expo Token
  const saveExpoToken = async (token: string): Promise<boolean> => {
    setSavingToken(true);
    try {
      const res = await fetch("/api/user/expo-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error("Failed to connect Expo token", {
          description: data.message || "Invalid Expo Access Token",
        });
        return false;
      }

      setExpoToken(data.expoToken);
      toast.success(data.message || "Expo account connected!");
      return true;
    } catch (err: any) {
      toast.error("Failed to connect token", { description: err.message });
      return false;
    } finally {
      setSavingToken(false);
    }
  };

  // 3. Remove Expo Token
  const removeExpoToken = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/user/expo-token", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setExpoToken(null);
        toast.success("Expo account disconnected");
        return true;
      }
      return false;
    } catch (err) {
      console.error("[useExpoDeployment] Failed to disconnect token:", err);
      return false;
    }
  };

  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // 4. Fetch Builds
  const fetchBuilds = useCallback(async (options?: { silent?: boolean }) => {
    if (!projectId || !session?.jwtToken) return;
    setLoadingBuilds(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}/builds`, {
        headers: {
          Authorization: `Bearer ${session.jwtToken}`,
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.builds)) {
        setBuilds(data.builds);
        setTotalCount(typeof data.totalCount === "number" ? data.totalCount : data.builds.length);
        setHasMore(Boolean(data.hasMore));
        setLastRefreshedAt(new Date());
        if (!options?.silent) {
          toast.success("Build status updated");
        }
      }
    } catch (err: any) {
      console.warn("[useExpoDeployment] Failed to fetch builds:", err);
      if (!options?.silent) {
        toast.error("Failed to refresh build status");
      }
    } finally {
      setLoadingBuilds(false);
    }
  }, [projectId, session?.jwtToken]);

  // Initial load and on modal open
  useEffect(() => {
    if (!enabled) return;

    fetchExpoToken();
    if (projectId && session?.jwtToken) {
      fetchBuilds({ silent: true });
    }
  }, [fetchExpoToken, fetchBuilds, projectId, session?.jwtToken, enabled]);

  // Polling only when modal is open (enabled) and an active build exists (every 2 mins)
  useEffect(() => {
    if (!enabled) {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    const hasActive = builds.some(
      (b) => b.status === "QUEUED" || b.status === "IN_PROGRESS"
    );

    if (hasActive) {
      pollTimerRef.current = setInterval(() => {
        fetchBuilds({ silent: true });
      }, pollIntervalMs);
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [builds, fetchBuilds, enabled, pollIntervalMs]);

  // 5. Trigger Build
  const triggerBuild = async (buildType: "APK" | "AAB"): Promise<boolean> => {
    if (!projectId) {
      toast.error("Project ID missing");
      return false;
    }

    if (!session?.jwtToken) {
      toast.error("Please sign in to trigger builds");
      return false;
    }

    setTriggeringBuild(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}/build`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.jwtToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ buildType }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error("Build failed to start", {
          description: data.message || "Could not trigger EAS build",
        });
        return false;
      }

      toast.success(`EAS ${buildType} build started!`, {
        description: "Your build is queued on Expo Cloud. Check progress below.",
      });

      await fetchBuilds();
      return true;
    } catch (err: any) {
      toast.error("Failed to start build", { description: err.message });
      return false;
    } finally {
      setTriggeringBuild(false);
    }
  };

  const [cancelingBuildId, setCancelingBuildId] = useState<string | null>(null);

  // 6. Cancel Build
  const cancelBuild = async (buildId: string): Promise<boolean> => {
    if (!projectId || !session?.jwtToken) return false;
    setCancelingBuildId(buildId);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/projects/${projectId}/builds/${buildId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.jwtToken}`,
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error("Failed to cancel build", {
          description: data.message || "Could not cancel build",
        });
        return false;
      }

      toast.success("Build canceled successfully");
      await fetchBuilds();
      return true;
    } catch (err: any) {
      toast.error("Failed to cancel build", { description: err.message });
      return false;
    } finally {
      setCancelingBuildId(null);
    }
  };

  const latestBuild = builds[0] || null;
  const isBuilding = builds.some(
    (b) => b.status === "QUEUED" || b.status === "IN_PROGRESS"
  );

  return {
    expoToken,
    loadingToken,
    savingToken,
    saveExpoToken,
    removeExpoToken,
    builds,
    totalCount,
    hasMore,
    latestBuild,
    isBuilding,
    loadingBuilds,
    triggeringBuild,
    triggerBuild,
    cancelingBuildId,
    cancelBuild,
    lastRefreshedAt,
    refetchBuilds: () => fetchBuilds({ silent: false }),
  };
}
