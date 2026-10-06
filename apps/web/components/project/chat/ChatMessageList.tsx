"use client";

import { useEffect, useRef } from "react";
import { SidebarContent } from "@/components/ui/sidebar";
import { ChatMessage } from "@/lib/types";
import QuestionCard from "../question-card";
import UserMessageBubble from "./UserMessageBubble";
import AssistantMessageBubble from "./AssistantMessageBubble";
import ThinkingIndicator from "./ThinkingIndicator";
import ActionGroup from "./ActionGroup";

interface ChatMessageListProps {
  messages: ChatMessage[];
  busy: boolean;
  liveThought?: string;
  onAnswerSubmit?: (questionId: string, answer: string) => Promise<void>;
}

export default function ChatMessageList({
  messages,
  busy,
  liveThought,
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
      const container = feedRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 160;
      if (isNearBottom) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, busy]);

  const groupedItems: (
    | ChatMessage
    | { type: "action-group"; actions: ChatMessage[]; id: string }
  )[] = [];
  let currentActionGroup: ChatMessage[] = [];

  messages.forEach((m) => {
    if (m.role === "action") {
      currentActionGroup.push(m);
    } else {
      if (currentActionGroup.length > 0) {
        groupedItems.push({
          type: "action-group",
          actions: currentActionGroup,
          id: `${currentActionGroup[0].id}-group`,
        });
        currentActionGroup = [];
      }
      groupedItems.push(m);
    }
  });

  if (currentActionGroup.length > 0) {
    groupedItems.push({
      type: "action-group",
      actions: currentActionGroup,
      id: `${currentActionGroup[0].id}-group`,
    });
  }

  const lastGroupedItem = groupedItems[groupedItems.length - 1];
  const lastItemIsActionGroup =
    lastGroupedItem && "type" in lastGroupedItem && lastGroupedItem.type === "action-group";
  const hasPendingQuestion = messages.some(
    (m) => m.role === "question" && !m.answered
  );

  return (
    <SidebarContent className="p-0! flex-1 overflow-hidden">
      <div
        ref={feedRef}
        className="h-full overflow-y-auto px-4 pt-4 pb-6 space-y-4 text-[13px] leading-[1.6]"
      >
        {groupedItems.map((item, idx) => {
          if ("type" in item && item.type === "action-group") {
            const isLast = idx === groupedItems.length - 1;
            return (
              <ActionGroup
                key={item.id}
                actions={item.actions}
                isCurrentTurn={isLast && busy}
                liveThought={isLast ? liveThought : undefined}
              />
            );
          }

          const m = item as ChatMessage;
          return (
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
          );
        })}

        {/* Only show ThinkingIndicator if the model is busy, not executing an action group, and not waiting on a pending question */}
        {busy && !lastItemIsActionGroup && !hasPendingQuestion && <ThinkingIndicator thought={liveThought} />}
      </div>
    </SidebarContent>
  );
}
