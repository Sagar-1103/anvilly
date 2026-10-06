"use client";

import {
  Loader2,
  FileEdit,
  FileCode2,
  Terminal,
  Hammer,
  Rocket,
  HelpCircle,
  FileDown,
  Trash2,
  Check,
} from "lucide-react";
import React from "react";

interface ActionIndicatorProps {
  content: string;
  actionType?: string;
  done?: boolean;
}

export function getIconForActionType(actionType?: string, className?: string) {
  const classes = className || "w-3.5 h-3.5";
  switch (actionType) {
    case "write_file_tool":
      return <FileEdit className={`${classes} text-zinc-300`} />;
    case "read_file_tool":
      return <FileCode2 className={`${classes} text-zinc-400`} />;
    case "delete_file_tool":
      return <Trash2 className={`${classes} text-zinc-400`} />;
    case "bash_tool":
      return <Terminal className={`${classes} text-zinc-300`} />;
    case "build_project_tool":
      return <Hammer className={`${classes} text-zinc-400`} />;
    case "run_project_tool":
      return <Rocket className={`${classes} text-zinc-400`} />;
    case "qna_tool":
      return <HelpCircle className={`${classes} text-zinc-400`} />;
    default:
      return <FileDown className={`${classes} text-zinc-400`} />;
  }
}

export function formatActionContent(content: string, done: boolean = false) {
  if (!content) return null;

  const trimmed = content.trim();
  const firstSpaceIdx = trimmed.indexOf(" ");
  if (firstSpaceIdx === -1) {
    return <span className="truncate">{trimmed}</span>;
  }

  const verb = trimmed.slice(0, firstSpaceIdx);
  const target = trimmed.slice(firstSpaceIdx + 1).trim();

  if (!target) {
    return <span className="truncate">{trimmed}</span>;
  }

  let displayVerb = verb;
  if (done) {
    const v = verb.toLowerCase();
    if (v === "writing") displayVerb = "Wrote";
    else if (v === "reading") displayVerb = "Read";
    else if (v === "deleting") displayVerb = "Deleted";
    else if (v === "running") displayVerb = "Ran";
    else if (v === "building") displayVerb = "Built";
    else if (v === "starting" || v === "restarting") displayVerb = "Restarted";
    else if (v === "asking") displayVerb = "Asked";
  }

  const isCodeOrPath =
    target.includes("/") ||
    target.includes(".") ||
    target.startsWith("npm ") ||
    target.startsWith("bun ") ||
    target.startsWith("git ") ||
    verb.toLowerCase() === "running";

  return (
    <div className="inline-flex items-center gap-1.5 truncate max-w-full text-[12.5px] leading-tight">
      <span className="text-zinc-400 shrink-0 font-medium">{displayVerb}</span>
      {isCodeOrPath ? (
        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/[0.04] text-zinc-300 truncate max-w-[240px] sm:max-w-[320px] border border-white/6">
          {target}
        </span>
      ) : (
        <span className="text-zinc-300 truncate font-medium">{target}</span>
      )}
    </div>
  );
}

export default function ActionIndicator({ content, actionType, done }: ActionIndicatorProps) {
  return (
    <div
      className={`group/item flex items-center justify-between gap-2.5 py-1 px-2 rounded-md transition-colors ${
        done
          ? "text-zinc-400 hover:text-zinc-300 hover:bg-white/[0.03]"
          : "text-zinc-200 bg-white/[0.04]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex-shrink-0">
          {!done ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
          ) : (
            getIconForActionType(
              actionType,
              "w-3.5 h-3.5 opacity-60 group-hover/item:opacity-90 transition-opacity"
            )
          )}
        </div>

        <div className="truncate min-w-0 flex-1">
          {formatActionContent(content, done)}
        </div>
      </div>

      <div className="flex-shrink-0 ml-1.5">
        {done ? (
          <Check className="w-3 h-3 text-zinc-500" />
        ) : (
          <span className="text-[10px] text-zinc-400 font-mono tracking-tight bg-white/4 px-1.5 py-0.5 rounded border border-white/6">
            running
          </span>
        )}
      </div>
    </div>
  );
}
