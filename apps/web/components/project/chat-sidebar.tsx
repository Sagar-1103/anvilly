"use client";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useEffect, useRef, useState } from "react";
import { ChatMessage, Project } from "@/lib/types";
import QuestionCard from "./question-card";

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
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const txt = prompt.trim();
    if (!txt || busy) return;
    setPrompt("");
    await sendPrompt(txt);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/6">
      {/* Sidebar Top Header — project name */}
      <SidebarHeader className="h-12 px-4 flex flex-row items-center gap-3 border-b border-white/6 shrink-0 bg-black">
        <Link href="/" className="shrink-0">
          <span className="text-[15px] font-extrabold tracking-tighter font-mono text-white">
            anvilly
          </span>
        </Link>
        <span className="h-4 w-0.5 bg-white/10" />
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-white transition-colors truncate">
          {project.title || "Untitled Project"}
        </p>
      </SidebarHeader>

      {/* Chat Messages */}
      <SidebarContent className="p-0! flex-1 overflow-hidden">
        <div
          ref={feedRef}
          className="h-full overflow-y-auto px-4 pt-4 pb-6 space-y-4 text-[13px] leading-[1.6]"
        >
          {messages.map((m) => (
            <div key={m.id}>
              {m.role === "question" && m.questionData ? (
                <div className="flex justify-start">
                  <QuestionCard
                    questionData={m.questionData}
                    answered={m.answered}
                    selectedAnswer={m.selectedAnswer}
                    onAnswerSubmit={onAnswerSubmit || (async () => {})}
                  />
                </div>
              ) : m.role === "user" ? (
                <div className="flex justify-end">
                  <div className="bg-white/[0.07] border border-white/6 text-zinc-200 px-4 py-2.5 rounded-2xl rounded-br-md max-w-[85%] text-[13px] whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div className="flex justify-start">
                  <div className="bg-zinc-900/80 border border-white/6 text-zinc-300 px-4 py-3 rounded-2xl rounded-bl-md max-w-[90%] text-[13px] whitespace-pre-wrap leading-relaxed">
                    {m.content}
                  </div>
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-zinc-400 text-[12px] font-mono py-2 bg-zinc-950/40 px-3 rounded-xl border border-white/5 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Anvilly is thinking...
            </div>
          )}
        </div>
      </SidebarContent>

      {/* Prompt Input Footer */}
      <SidebarFooter className="p-0! border-t border-white/6 bg-black">
        <div className="p-3">
          <form
            onSubmit={send}
            className="bg-white/3 border border-white/6 rounded-xl p-3 flex flex-col min-h-24 focus-within:border-white/12 transition-colors"
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              disabled={busy}
              placeholder="Ask Anvilly..."
              rows={2}
              className="flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed disabled:opacity-50"
            />
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/4">
              <button
                type="button"
                disabled={busy}
                className="w-6 h-6 cursor-pointer rounded-md bg-white/4 border border-white/6 text-zinc-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!prompt.trim() || busy}
                  className="w-6 h-6 cursor-pointer rounded-lg bg-white text-black flex items-center justify-center disabled:opacity-20 hover:bg-zinc-200 transition-colors"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}