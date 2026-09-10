"use client";

import { Star } from "lucide-react";

interface QuestionOptionItemProps {
  option: string;
  index: number;
  isSelected: boolean;
  isRecommended: boolean;
  disabled?: boolean;
  onSelect: (index: number) => void;
}

export default function QuestionOptionItem({
  option,
  index,
  isSelected,
  isRecommended,
  disabled = false,
  onSelect,
}: QuestionOptionItemProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(index)}
      className={`w-full text-left p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-3 border ${
        isSelected
          ? "bg-violet-600/15 border-violet-500 text-white shadow-sm shadow-violet-500/10"
          : isRecommended
          ? "bg-white/[0.04] border-violet-500/40 hover:border-violet-500/70 text-zinc-200"
          : "bg-white/[0.02] border-white/8 hover:border-white/20 text-zinc-300"
      }`}
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <span
          className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
            isSelected
              ? "border-violet-400 bg-violet-500 text-white"
              : "border-zinc-600 bg-transparent"
          }`}
        >
          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </span>
        <span className="text-[12.5px] font-medium leading-snug">{option}</span>
      </div>

      {isRecommended && (
        <span className="shrink-0 text-[10px] font-semibold text-violet-300 bg-violet-500/20 border border-violet-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
          <Star className="w-2.5 h-2.5 fill-current" />
          Recommended
        </span>
      )}
    </button>
  );
}
