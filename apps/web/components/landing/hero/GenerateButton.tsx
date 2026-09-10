"use client";

import { Sparkles, Loader2 } from "lucide-react";

interface GenerateButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function GenerateButton({
  isLoading,
  disabled,
  onClick,
}: GenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 group-hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>Generate</span>
        </>
      )}
    </button>
  );
}
