"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";
import { processStream } from "@/lib/event-stream";
import { ChatMessage, Project } from "@/lib/types";

function extractTextChatMessage(m: any, idx: number): ChatMessage | null {
  if (!m) return null;

  const roleStr = String(m.role || "").toUpperCase();
  const isUser = roleStr === "USER";
  const isAI = roleStr === "AI" || roleStr === "ASSISTANT";

  if (!isUser && !isAI) return null;

  const typeStr = String(m.type || "").toUpperCase();

  if (typeStr === "TOOL_CALL" && String(m.toolCall || "").toUpperCase() === "QNA_TOOL") {
    try {
      const parsed = JSON.parse(m.content || "{}");
      const { arguments: args, result } = parsed;
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
    } catch {
      // malformed, skip
    }
    return null;
  }

  if (typeStr === "TOOL_CALL") return null;

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

    if (!alreadyAddedInState) {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: "user", content: userPrompt },
      ]);
    }

    const assistantMsgId = `assistant-${Date.now()}`;
    let assistantAdded = false;

    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${projectId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.jwtToken}`,
        },
        method: "POST",
        body: JSON.stringify({ userPrompt }),
      });

      const reader = response.body?.getReader();
      if (!reader) {
        setBusy(false);
        return;
      }

      await processStream(
        reader,
        reloadProjectLink,
        (textChunk: string) => {
          if (!textChunk || typeof textChunk !== "string") return;
          const cleanChunk = textChunk.trim();
          if (!cleanChunk) return;

          setMessages((prev) => {
            if (!assistantAdded) {
              assistantAdded = true;
              return [
                ...prev,
                { id: assistantMsgId, role: "assistant", content: cleanChunk },
              ];
            } else {
              return prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: m.content
                        ? m.content + "\n\n" + cleanChunk
                        : cleanChunk,
                    }
                  : m
              );
            }
          });
          setBusy(false);
        },
        undefined,
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
                answered: false,
              },
            ];
          });
        },
        (toolName: string, args: any) => onFileChangeRef.current?.(toolName, args),
      );
    } catch (error) {
      console.error("Error in sendPrompt stream:", error);
    } finally {
      setBusy(false);
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
        const { title, url, messages: backendMessages, userPrompt } = res.data;
        setProject({ url: url, title: title });

        const chatMsgs: ChatMessage[] = (backendMessages || [])
          .map((m: any, idx: number) => extractTextChatMessage(m, idx))
          .filter(Boolean) as ChatMessage[];

        if (chatMsgs.length > 0) {
          setMessages(chatMsgs);
        } else if (userPrompt && !initialPromptSentRef.current) {
          initialPromptSentRef.current = true;
          setMessages([{ id: "msg-0", role: "user", content: userPrompt }]);
          await sendPrompt(userPrompt, true);
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
    iframeRef,
    reloadProjectLink,
    sendPrompt,
    handleAnswerSubmit,
    loading,
    error,
    getProject,
  };
}
