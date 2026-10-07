"use client";

import { Loader2 } from "lucide-react";

export default function PreviewBuildingState() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#121215] text-zinc-400 select-none p-6 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-3">
        {/* Minimalist, smooth spinner */}
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-zinc-400 animate-spin [animation-duration:1.2s]" strokeWidth={2} />
        </div>

        {/* Clean, quiet label */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xs font-medium text-zinc-300 tracking-tight">
            Generating preview...
          </p>
          <p className="text-[11px] text-zinc-500">
            Your application will appear here shortly
          </p>
        </div>
      </div>
    </div>
  );
}
