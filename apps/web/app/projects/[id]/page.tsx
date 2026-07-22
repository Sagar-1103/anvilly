"use client";

import { use, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { processStream } from "@/lib/event-stream";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import ChatSidebar from "@/components/project/chat-sidebar";
import RightHeader from "@/components/project/right-header";
import PreviewViewport from "@/components/project/preview-viewport";
import { toast } from "sonner";
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
  if (contentStr.startsWith("{") && (contentStr.includes('"arguments"') || contentStr.includes('"callId"'))) {
    return null;
  }

  return {
    id: `msg-${idx}-${Date.now()}`,
    role: isUser ? "user" : "assistant",
    content: contentStr,
  };
}

export default function ProjectIDEPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const { data: session } = useSession();
  const [project, setProject] = useState<Project>({ title: "", url: "" });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reloadProjectLink = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.src = iframe.src;
    toast.success(`Website Reloaded`);
  };

  const sendPrompt = async (userPrompt: string, alreadyAddedInState: boolean = false) => {
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
                  ? { ...m, content: m.content ? m.content + "\n\n" + cleanChunk : cleanChunk }
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
            const alreadyExists = prev.some((m) => m.id === `q-${questionData.questionId}`);
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
        }
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

  const getProject = async () => {
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
        const { title, url, messages: backendMessages, userPrompt } = res.data;
        setProject({ url: url, title: title });

        const chatMsgs: ChatMessage[] = (backendMessages || [])
          .map((m: any, idx: number) => extractTextChatMessage(m, idx))
          .filter(Boolean) as ChatMessage[];

        if (chatMsgs.length > 0) {
          setMessages(chatMsgs);
        } else if (userPrompt) {
          setMessages([{ id: "msg-0", role: "user", content: userPrompt }]);
          await sendPrompt(userPrompt, true);
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  useEffect(() => {
    if (session?.jwtToken && projectId) {
      getProject();
    }
  }, [session, projectId]);

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "400px",
          "--sidebar-width-icon": "0px",
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen w-screen bg-black text-white overflow-hidden antialiased">
        <ChatSidebar
          project={project}
          messages={messages}
          busy={busy}
          sendPrompt={(promptText) => sendPrompt(promptText, false)}
          onAnswerSubmit={handleAnswerSubmit}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <RightHeader
            device={device}
            setDevice={setDevice}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reloadProjectLink={reloadProjectLink}
            project={project}
          />
          <PreviewViewport
            device={device}
            activeTab={activeTab}
            projectUrl={project.url}
            iframeRef={iframeRef}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
