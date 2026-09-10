"use client";

import { useEffect, useRef } from "react";
import { SidebarContent } from "@/components/ui/sidebar";
import { ChatMessage } from "@/lib/types";
import QuestionCard from "../question-card";
import UserMessageBubble from "./UserMessageBubble";
import AssistantMessageBubble from "./AssistantMessageBubble";
import ThinkingIndicator from "./ThinkingIndicator";

interface ChatMessageListProps {
  messages: ChatMessage[];
  busy: boolean;
  onAnswerSubmit?: (questionId: string, answer: string) => Promise<void>;
}

export default function ChatMessageList({
  messages,
  busy,
  onAnswerSubmit,
}: ChatMessageListProps) {
  const feedRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!feedRef.current) return;
    if (isInitialMount.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
      if (messages.length > 0) {
        isInitialMount.current = false;
      }
    } else {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, busy]);

  return (
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
              <UserMessageBubble content={m.content} />
            ) : (
              <AssistantMessageBubble content={m.content} />
            )}
          </div>
        ))}

        {busy && <ThinkingIndicator />}
      </div>
    </SidebarContent>
  );
}
