"use client";

import { Check } from "lucide-react";

interface QuestionCardAnsweredProps {
  question: string;
  submittedText: string;
}

export default function QuestionCardAnswered({
  question,
  submittedText,
}: QuestionCardAnsweredProps) {
  return (
    <div className="bg-zinc-900/90 border border-violet-500/20 text-zinc-300 p-4 rounded-2xl rounded-bl-md max-w-[92%] text-[13px] space-y-2 shadow-lg">
      <div className="flex items-center gap-2 text-violet-400 font-medium text-[12px]">
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Clarification Answered</span>
      </div>
      <p className="text-zinc-400 text-[12px]">{question}</p>
      <div className="bg-violet-950/40 border border-violet-500/30 text-violet-200 px-3.5 py-2 rounded-xl text-[13px] font-medium flex items-center justify-between">
        <span>{submittedText}</span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-violet-400 bg-violet-900/50 px-2 py-0.5 rounded-md border border-violet-500/30">
          Selected
        </span>
      </div>
    </div>
  );
}
