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
    <div className="bg-[#242429] border border-[#5856d6]/30 text-zinc-300 p-4 rounded-2xl max-w-[95%] text-[13px] space-y-2 shadow-lg">
      <div className="flex items-center gap-2 text-purple-300 font-medium text-[12px]">
        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Clarification Answered</span>
      </div>
      <p className="text-zinc-400 text-[12px]">{question}</p>
      <div className="bg-[#391e66] border border-[#6366f1]/40 text-purple-100 px-3.5 py-2 rounded-xl text-[13px] font-medium flex items-center justify-between shadow-xs">
        <span>{submittedText}</span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-purple-200 bg-purple-900/80 px-2 py-0.5 rounded-md border border-purple-400/40">
          Selected
        </span>
      </div>
    </div>
  );
}
