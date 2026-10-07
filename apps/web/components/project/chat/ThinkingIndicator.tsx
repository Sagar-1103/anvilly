"use client";

import { Loader2 } from "lucide-react";

interface ThinkingIndicatorProps {
  thought?: string;
}

export default function ThinkingIndicator({ thought }: ThinkingIndicatorProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#242429] border border-white/10 text-zinc-300 text-[12.5px] select-none w-fit my-1.5 shadow-sm">
      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6366f1] shrink-0" />
      <span className="font-medium truncate max-w-[280px]">
        {thought ? thought : "Generating response..."}
      </span>
    </div>
  );
}
