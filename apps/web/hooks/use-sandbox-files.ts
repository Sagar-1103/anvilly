"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import type { SandboxFile, FileTreeNode } from "@/lib/types";
import { buildTreeFromPaths, getLanguageFromPath } from "@/lib/file-utils";

export function useSandboxFiles(projectId: string) {
  const { data: session } = useSession();
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [fileContents, setFileContents] = useState<Map<string, string>>(
    new Map()
  );
  const [activeFile, setActiveFile] = useState<SandboxFile | null>(null);
  const [openTabs, setOpenTabs] = useState<SandboxFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [recentlyChanged, setRecentlyChanged] = useState<
    Map<string, "new" | "modified">
  >(new Map());
  const [autoFollow, setAutoFollow] = useState(true);

  const autoFollowRef = useRef(true);
  const fileContentsRef = useRef(fileContents);
  const activeFileRef = useRef(activeFile);
  const openTabsRef = useRef(openTabs);

  useEffect(() => {
    autoFollowRef.current = autoFollow;
  }, [autoFollow]);
  useEffect(() => {
    fileContentsRef.current = fileContents;
  }, [fileContents]);
  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);
  useEffect(() => {
    openTabsRef.current = openTabs;
  }, [openTabs]);

  const fileTree = useMemo(() => buildTreeFromPaths(filePaths), [filePaths]);

  const fetchFileContent = useCallback(
    async (path: string): Promise<string> => {
      const cached = fileContentsRef.current.get(path);
      if (cached !== undefined) return cached;

      if (!session?.jwtToken) return "";

      setFileLoading(true);
      try {
        const res = await axios.get(
          `${BACKEND_URL}/api/projects/${projectId}/files/read`,
          {
            params: { path },
            headers: { Authorization: `Bearer ${session.jwtToken}` },
          }
        );
        if (res.data.success) {
          const content = typeof res.data.content === "string" ? res.data.content : "";
          setFileContents((prev) => new Map(prev).set(path, content));
          return content;
        }
      } catch (error) {
        console.error("Error reading file:", error);
      } finally {
        setFileLoading(false);
      }
      return "";
    },
    [projectId, session?.jwtToken]
  );

  const selectFile = useCallback(
    async (path: string) => {
      const name = path.split("/").pop() || path;
      const language = getLanguageFromPath(path);

      let content = fileContentsRef.current.get(path);
      if (content === undefined) {
        content = await fetchFileContent(path);
      }

      const file: SandboxFile = { name, path, language, content: content || "" };

      setActiveFile(file);
      setOpenTabs((prev) => {
        if (prev.some((t) => t.path === path)) {
          return prev.map((t) => (t.path === path ? file : t));
        }
        return [...prev, file];
      });
    },
    [fetchFileContent]
  );

  const fetchFileTree = useCallback(async () => {
    if (!session?.jwtToken) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/projects/${projectId}/files`,
        { headers: { Authorization: `Bearer ${session.jwtToken}` } }
      );
      if (res.data.success) {
        const files: string[] = res.data.files || [];
        setFilePaths(files);

        // Auto-select entry file if no file is currently selected
        if (!activeFileRef.current && files.length > 0) {
          const defaultCandidates = [
            "src/App.tsx",
            "src/App.jsx",
            "src/app.tsx",
            "app/page.tsx",
            "src/main.tsx",
            "src/index.tsx",
            "package.json",
          ];
          const toOpen =
            defaultCandidates.find((c) => files.includes(c)) ||
            files.find((f) => /\.(tsx|jsx|ts|js)$/.test(f)) ||
            files[0];
          if (toOpen) {
            selectFile(toOpen);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching file tree:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, session?.jwtToken, selectFile]);

  const closeTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const tabIndex = prev.findIndex((t) => t.path === path);
      if (tabIndex === -1) return prev;
      const nextTabs = prev.filter((t) => t.path !== path);

      // If we closed the active tab, switch to adjacent tab
      if (activeFileRef.current?.path === path) {
        if (nextTabs.length > 0) {
          const nextIndex = Math.min(tabIndex, nextTabs.length - 1);
          setActiveFile(nextTabs[nextIndex]);
        } else {
          setActiveFile(null);
        }
      }
      return nextTabs;
    });
  }, []);

  const normalizePath = (location: string): string => {
    if (location.startsWith("/home/user/app/"))
      return location.slice("/home/user/app/".length);
    if (location.startsWith("/")) return location.slice(1);
    return location;
  };

  const handleFileChange = useCallback(
    (toolName: string, args: any) => {
      if (!args) return;

      const rawLocation = args.location || "";
      const path = normalizePath(rawLocation);
      if (!path) return;

      if (toolName === "write_file_tool") {
        const content = args.content || "";
        const name = path.split("/").pop() || path;
        const language = getLanguageFromPath(path);
        const file: SandboxFile = { name, path, language, content };

        const isExisting = filePaths.includes(path);

        // Cache content
        setFileContents((prev) => new Map(prev).set(path, content));

        // Add path
        setFilePaths((prev) => {
          if (prev.includes(path)) return prev;
          return [...prev, path].sort();
        });

        // Badge
        const changeType: "new" | "modified" = isExisting ? "modified" : "new";
        setRecentlyChanged((prev) => new Map(prev).set(path, changeType));
        setTimeout(() => {
          setRecentlyChanged((prev) => {
            const next = new Map(prev);
            if (next.get(path) === changeType) next.delete(path);
            return next;
          });
        }, 5000);

        if (autoFollowRef.current) {
          // Auto-follow: switch editor to this file
          setActiveFile(file);
          setOpenTabs((prev) => {
            if (prev.some((t) => t.path === path)) {
              return prev.map((t) => (t.path === path ? file : t));
            }
            return [...prev, file];
          });
        } else {
          // Just update content in existing tabs
          setOpenTabs((prev) =>
            prev.map((t) => (t.path === path ? { ...t, content } : t))
          );
          setActiveFile((prev) =>
            prev && prev.path === path ? { ...prev, content } : prev
          );
        }
      } else if (toolName === "delete_file_tool") {
        setFilePaths((prev) => prev.filter((p) => p !== path));
        setFileContents((prev) => {
          const next = new Map(prev);
          next.delete(path);
          return next;
        });
        setOpenTabs((prev) => {
          const next = prev.filter((t) => t.path !== path);
          return next.length > 0 ? next : [];
        });
        setActiveFile((prev) => {
          if (prev && prev.path === path) return null;
          return prev;
        });
      }
    },
    []
  );

  return {
    fileTree,
    filePaths,
    activeFile,
    openTabs,
    loading,
    fileLoading,
    recentlyChanged,
    autoFollow,
    setAutoFollow,
    fetchFileTree,
    selectFile,
    closeTab,
    handleFileChange,
    setActiveFile,
  };
}

export type SandboxFilesState = ReturnType<typeof useSandboxFiles>;
