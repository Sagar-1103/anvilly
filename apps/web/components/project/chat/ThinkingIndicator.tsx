"use client";

import { Loader2 } from "lucide-react";

interface ThinkingIndicatorProps {
  thought?: string;
}

export default function ThinkingIndicator({ thought }: ThinkingIndicatorProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/6 text-zinc-400 text-[12.5px] select-none w-fit my-1.5">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500 shrink-0" />
      <span className="font-medium truncate max-w-[280px]">
        {thought ? thought : "Thinking..."}
      </span>
    </div>
  );
}
