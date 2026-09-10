"use client";

import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { ChatMessage, Project } from "@/lib/types";
import ChatSidebarHeader from "./chat/ChatSidebarHeader";
import ChatMessageList from "./chat/ChatMessageList";
import ChatPromptInput from "./chat/ChatPromptInput";

interface ChatSidebarProps {
  project: Project;
  messages: ChatMessage[];
  busy: boolean;
  sendPrompt: (userPrompt: string) => Promise<void>;
  onAnswerSubmit?: (questionId: string, answer: string) => Promise<void>;
}

export default function ChatSidebar({
  project,
  messages,
  busy,
  sendPrompt,
  onAnswerSubmit,
}: ChatSidebarProps) {
  const [prompt, setPrompt] = useState("");

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const txt = prompt.trim();
    if (!txt || busy) return;
    setPrompt("");
    await sendPrompt(txt);
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-white/6 overflow-hidden">
      {/* 1. Sidebar Header */}
      <ChatSidebarHeader title={project.title} />

      {/* 2. Message Feed */}
      <ChatMessageList
        messages={messages}
        busy={busy}
        onAnswerSubmit={onAnswerSubmit}
      />

      {/* 3. Prompt Input Footer */}
      <ChatPromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        onSubmit={handleSend}
        busy={busy}
      />
    </Sidebar>
  );
}