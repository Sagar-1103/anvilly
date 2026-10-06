"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";
import { processStream } from "@/lib/event-stream";
import { ChatMessage, Project } from "@/lib/types";

function getActionLabel(toolName: string, args: any): string {
  const cleanTool = String(toolName || "").toLowerCase();
  const location = args?.location || args?.path || args?.filePath || "";
  const shortPath = location.replace(/^\/home\/user\/app\//, "").replace(/^\//, "");
  
  switch (cleanTool) {
    case "write_file_tool":
    case "create_file_tool":
    case "update_file_tool":
      return shortPath ? `Writing ${shortPath}` : "Writing file";
    case "read_file_tool":
      return shortPath ? `Reading ${shortPath}` : "Reading file";
    case "delete_file_tool":
      return shortPath ? `Deleting ${shortPath}` : "Deleting file";
    case "bash_tool": {
      const cmd = (args?.command || "").trim();
      return cmd ? `Running ${cmd.slice(0, 60)}` : "Running command";
    }
    case "build_project_tool":
      return "Building project";
    case "run_project_tool":
      return "Restarting dev server";
    case "qna_tool":
      return "Asking a question";
    default: {
      const readable = cleanTool.replace(/_tool$/i, "").replace(/_/g, " ").trim();
      if (readable) {
        return `Running ${readable}`;
      }
      return shortPath ? `Updating ${shortPath}` : "Executing action";
    }
  }
}

function extractTextChatMessage(m: any, idx: number): ChatMessage | null {
  if (!m) return null;

  const roleStr = String(m.role || "").toUpperCase();
  const isUser = roleStr === "USER";
  const isAI = roleStr === "AI" || roleStr === "ASSISTANT";

  if (!isUser && !isAI) return null;

  const typeStr = String(m.type || "").toUpperCase();
  const toolName = String(m.name || m.toolCall || m.tool_call || "").toLowerCase();

  if (typeStr === "TOOL_CALL" || toolName) {
    let args = m.arguments || m.args;
    let result = m.result;

    if (!args && typeof m.content === "string") {
      try {
        const parsed = JSON.parse(m.content);
        args = parsed?.arguments || parsed?.args || parsed;
        result = parsed?.result ?? result;
      } catch {}
    } else if (!args && m.content && typeof m.content === "object") {
      args = m.content.arguments || m.content.args || m.content;
      result = m.content.result ?? result;
    }

    if (typeof args === "string") {
      try {
        args = JSON.parse(args);
      } catch {}
    }

    if (toolName === "qna_tool") {
      if (args?.question && typeof result === "string") {
        return {
          id: `msg-${idx}-${Date.now()}`,
          role: "question",
          content: args.question,
          questionData: {
            questionId: `history-${idx}`,
            question: args.question,
          },
          answered: true,
          selectedAnswer: result,
        };
      }
      return null;
    }

    const resolvedToolName = toolName || "action";
    return {
      id: `msg-${idx}-${Date.now()}`,
      role: "action",
      content: getActionLabel(resolvedToolName, args),
      actionType: resolvedToolName,
      actionArgs: args,
      actionDone: true,
    };
  }

  let contentStr = "";
  if (typeof m.content === "string") {
    contentStr = m.content.trim();
  } else if (m.content && typeof m.content === "object") {
    contentStr = m.content.text || m.content.content || "";
  }

  if (!contentStr) return null;

  // Exclude raw tool call JSON dumps
  if (
    contentStr.startsWith("{") &&
    (contentStr.includes('"arguments"') || contentStr.includes('"callId"'))
  ) {
    return null;
  }

  return {
    id: `msg-${idx}-${Date.now()}`,
    role: isUser ? "user" : "assistant",
    content: contentStr,
  };
}

export function useProjectIDE(projectId: string, onFileChange?: (toolName: string, args: any) => void) {
  const { data: session, status } = useSession();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [project, setProject] = useState<Project>({ title: "", url: "" });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [liveThought, setLiveThought] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fetchedProjectIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const initialPromptSentRef = useRef(false);
  const onFileChangeRef = useRef(onFileChange);

  useEffect(() => {
    onFileChangeRef.current = onFileChange;
  }, [onFileChange]);

  const reloadProjectLink = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.src = iframe.src;
    toast.success("Website Reloaded");
  };

  const sendPrompt = async (
    userPrompt: string,
    alreadyAddedInState: boolean = false
  ) => {
    if (!userPrompt.trim() || busy) return;

    setBusy(true);
    setLiveThought("");

    if (!alreadyAddedInState) {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content: userPrompt },
      ]);
    }

    let latestText = "";

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.jwtToken}`,
        },
        method: "POST",
        body: JSON.stringify({ userPrompt }),
      });

      if (!response.ok) {
        toast.error("Failed to start project generation");
        setBusy(false);
        setLiveThought("");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setBusy(false);
        setLiveThought("");
        return;
      }

      await processStream(
        reader,
        reloadProjectLink,
        (textChunk: string) => {
          if (!textChunk?.trim()) return;
          latestText = textChunk.trim();
          const clean = textChunk.trim();
          if (!clean.startsWith("{") && !clean.startsWith("[")) {
            setLiveThought(clean.slice(0, 120));
          }
        },
        (toolData: any) => {
          setLiveThought("");
          if (!toolData?.name) return;
          const actionId = `action-${Date.now()}-${Math.random()}`;
          setMessages((prev) => [
            ...prev,
            {
              id: actionId,
              role: "action",
              content: getActionLabel(toolData.name, toolData.arguments),
              actionType: toolData.name,
              actionArgs: toolData.arguments,
              actionDone: false,
            },
          ]);

          if (
            toolData.name === "write_file_tool" ||
            toolData.name === "delete_file_tool"
          ) {
            onFileChangeRef.current?.(toolData.name, toolData.arguments || {});
          }
        },
        (questionData: any) => {
          if (!questionData || !questionData.questionId) return;
          setMessages((prev) => {
            const alreadyExists = prev.some(
              (m) => m.id === `q-${questionData.questionId}`
            );
            if (alreadyExists) return prev;
            return [
              ...prev,
              {
                id: `q-${questionData.questionId}`,
                role: "question",
                content: questionData.question,
                questionData,
                answered: questionData.answered ?? false,
                selectedAnswer: questionData.selectedAnswer || questionData.answer,
              },
            ];
          });
        },
        undefined,
        (data: { name: string }) => {
          setMessages((prev) => {
            const idx = [...prev].reverse().findIndex(
              (m) => m.role === "action" && m.actionType === data.name && !m.actionDone
            );
            if (idx === -1) return prev;
            const realIdx = prev.length - 1 - idx;
            const updated = [...prev];
            updated[realIdx] = { ...updated[realIdx], actionDone: true };
            return updated;
          });
        },
        () => {
          setLiveThought("");
          setMessages((prev) => {
            const resolved = prev.map((m) =>
              m.role === "action" && !m.actionDone ? { ...m, actionDone: true } : m
            );
            if (latestText) {
              return [
                ...resolved,
                { id: `assistant-${Date.now()}`, role: "assistant", content: latestText },
              ];
            }
            return resolved;
          });
        }
      );
    } catch (error) {
      console.error("Error in sendPrompt stream:", error);
    } finally {
      setBusy(false);
      setLiveThought("");
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "action" && !m.actionDone ? { ...m, actionDone: true } : m
        )
      );
    }
  };

  const handleAnswerSubmit = async (questionId: string, answer: string) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/projects/answer`,
        {
          questionId,
          answer,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.jwtToken}`,
          },
        }
      );
      toast.success("Answer submitted");
      setMessages((prev) =>
        prev.map((m) =>
          m.questionData?.questionId === questionId
            ? {
                ...m,
                answered: true,
                selectedAnswer: answer,
              }
            : m
        )
      );
    } catch (err) {
      console.error("Error submitting question answer:", err);
      toast.error("Failed to submit answer");
    }
  };

  const getProject = async (force: boolean = false) => {
    if (isFetchingRef.current) return;
    if (!force && fetchedProjectIdRef.current === projectId && project.url) return;

    isFetchingRef.current = true;
    if (!project.url) {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/projects/${projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.jwtToken}`,
          },
        }
      );
      const res = await response.data;

      if (res.success) {
        fetchedProjectIdRef.current = projectId;
        const {
          title,
          url,
          expoUrl,
          tunnelUrl,
          template,
          messages: backendMessages,
          userPrompt,
        } = res.data;
        setProject({
          url: url || "",
          title: title || "",
          expoUrl,
          tunnelUrl,
          template,
        });

        if (template === "node_react_native_expo") {
          setDevice("mobile");
        }

        let chatMsgs: ChatMessage[] = (backendMessages || [])
          .map((m: any, idx: number) => extractTextChatMessage(m, idx))
          .filter(Boolean) as ChatMessage[];
          
        // Post-process history: Keep only the LAST AI TEXT message to avoid huge text walls
        // We iterate backwards to find the last assistant message
        let lastAssistantMsgIndex = -1;
        for (let i = chatMsgs.length - 1; i >= 0; i--) {
            if (chatMsgs[i].role === "assistant") {
                lastAssistantMsgIndex = i;
                break;
            }
        }
        
        chatMsgs = chatMsgs.filter((msg, idx) => {
            if (msg.role === "assistant") {
                return idx === lastAssistantMsgIndex;
            }
            return true;
        });

        if (chatMsgs.length > 0) {
          setMessages(chatMsgs);
        } else if (userPrompt && !initialPromptSentRef.current) {
          initialPromptSentRef.current = true;
          setMessages([{ id: "msg-0", role: "user", content: userPrompt }]);
          void sendPrompt(userPrompt, true);
        }
        setLoading(false);
      } else {
        const msg = res.message || "Project not found";
        setError({ message: msg, statusCode: 404 });
        toast.error(msg);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error fetching project:", err);
      const statusCode = err.response?.status || 404;
      const message =
        err.response?.data?.message ||
        (statusCode === 403
          ? "Access denied. You do not have permission to view this project."
          : "Project not found or inaccessible.");
      setError({ message, statusCode });
      setLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  };

  const jwtToken = session?.jwtToken;

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated" || !jwtToken) {
      setLoading(false);
      setError({
        message: "You must be signed in to view this project.",
        statusCode: 401,
      });
      return;
    }
    if (projectId && fetchedProjectIdRef.current !== projectId) {
      getProject();
    }
  }, [jwtToken, status, projectId]);

  return {
    device,
    setDevice,
    activeTab,
    setActiveTab,
    project,
    messages,
    busy,
    liveThought,
    iframeRef,
    reloadProjectLink,
    sendPrompt,
    handleAnswerSubmit,
    loading,
    error,
    getProject,
  };
}
