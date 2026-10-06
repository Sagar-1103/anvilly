"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
} from "lucide-react";
import ActionIndicator, {
  getIconForActionType,
  formatActionContent,
} from "./ActionIndicator";
import { ChatMessage } from "@/lib/types";

interface ActionGroupProps {
  actions: ChatMessage[];
  isCurrentTurn?: boolean;
  liveThought?: string;
}

export default function ActionGroup({
  actions,
  isCurrentTurn,
  liveThought,
}: ActionGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const isAnyActionRunning = actions.some((a) => !a.actionDone);
  const activeAction = actions.slice().reverse().find((a) => !a.actionDone);
  const latestAction = actions[actions.length - 1];
  const completedCount = actions.filter((a) => a.actionDone).length;

  const uniqueActionTypes = Array.from(
    new Set(actions.map((a) => a.actionType).filter(Boolean))
  ) as string[];

  // Auto-scroll the internal list when expanded and new actions arrive
  useEffect(() => {
    if (isExpanded && listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [actions.length, isExpanded]);

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const isLive = isCurrentTurn || isAnyActionRunning;

  return (
    <div className="w-full my-1.5">
      {!isExpanded ? (
        isLive ? (
          /* Live running state: clean, tidy, modern card matching app theme */
          <div
            onClick={toggleExpanded}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/6 hover:border-white/10 transition-colors cursor-pointer select-none group"
            role="button"
            tabIndex={0}
            title="Click to view details"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 shrink-0" />

              <div className="flex items-center gap-2 truncate min-w-0 text-[12.5px]">
                {activeAction ? (
                  <>
                    <span className="shrink-0">
                      {getIconForActionType(activeAction.actionType, "w-3.5 h-3.5")}
                    </span>
                    <div className="truncate">
                      {formatActionContent(activeAction.content, false)}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 truncate text-zinc-300">
                    {liveThought ? (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-zinc-500 font-medium shrink-0">Planning</span>
                        <span className="text-zinc-600 shrink-0">•</span>
                        <span className="text-zinc-300 truncate font-mono text-[11.5px] bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/6">
                          {liveThought}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 font-medium">Planning next step...</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-[11px] font-mono text-zinc-500 bg-white/[0.04] border border-white/6 px-2 py-0.5 rounded-full">
                {actions.length} action{actions.length !== 1 ? "s" : ""}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
            </div>
          </div>
        ) : (
          /* Completed/history state: minimal, unobtrusive row matching Lovable aesthetic */
          <div
            onClick={toggleExpanded}
            className="w-fit max-w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer select-none group text-zinc-400 hover:text-zinc-200 my-0.5 text-[12.5px]"
            role="button"
            tabIndex={0}
            title="Click to view action history"
          >
            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
              {uniqueActionTypes.slice(0, 4).map((type, i) => (
                <span key={i}>{getIconForActionType(type, "w-3.5 h-3.5")}</span>
              ))}
              {uniqueActionTypes.length > 4 && (
                <span className="text-[10px] text-zinc-500 font-mono">
                  +{uniqueActionTypes.length - 4}
                </span>
              )}
            </div>

            <span className="text-[12px] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              {actions.length} action{actions.length !== 1 ? "s" : ""}
            </span>

            <ChevronDown className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </div>
        )
      ) : (
        /* Expanded state: bounded scrollable container handling any number of actions */
        <div className="w-full flex flex-col gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/6 transition-all my-1.5">
          {/* Header */}
          <div
            onClick={toggleExpanded}
            className="flex items-center justify-between pb-2 border-b border-white/6 select-none cursor-pointer group"
          >
            <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-300">
              {isAnyActionRunning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 shrink-0" />
                  <span>
                    Executing actions ({completedCount}/{actions.length})
                  </span>
                </>
              ) : isCurrentTurn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 shrink-0" />
                  <span>Planning next step...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>
                    {actions.length} action{actions.length !== 1 ? "s" : ""} completed
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={toggleExpanded}
              className="flex items-center gap-1 text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors py-0.5 px-1.5 rounded hover:bg-white/4"
            >
              <span>Show less</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>

          {/* Bounded Scrollable List for handling large numbers of actions */}
          <div
            ref={listRef}
            className="max-h-56 sm:max-h-64 overflow-y-auto space-y-1 pr-1"
          >
            {actions.map((a, idx) => (
              <ActionIndicator
                key={a.id || idx}
                content={a.content}
                actionType={a.actionType}
                done={a.actionDone}
              />
            ))}

            {/* If currently in planning state, render the planning row inside the expanded list */}
            {isCurrentTurn && !activeAction && (
              <div className="flex items-center gap-2.5 py-1.5 px-2 rounded-md bg-white/[0.02] border border-white/6 text-[12px] text-zinc-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500 shrink-0" />
                <span className="truncate">
                  {liveThought ? `Planning • ${liveThought}` : "Planning next step..."}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
