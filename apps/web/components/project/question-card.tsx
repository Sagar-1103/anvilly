"use client";

import { useEffect, useState } from "react";
import { QuestionPayload } from "@/lib/types";

interface QuestionCardProps {
  questionData: QuestionPayload;
  answered?: boolean;
  selectedAnswer?: string;
  onAnswerSubmit: (questionId: string, answer: string) => Promise<void>;
}

export default function QuestionCard({
  questionData,
  answered = false,
  selectedAnswer,
  onAnswerSubmit,
}: QuestionCardProps) {
  const { questionId, question, options = [], recommended } = questionData;
  const [selectedIndex, setSelectedIndex] = useState<number | "custom" | null>(
    typeof recommended === "number" ? recommended : null
  );
  const [customText, setCustomText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isAnswered, setIsAnswered] = useState(answered);
  const [submittedText, setSubmittedText] = useState(selectedAnswer || "");

  useEffect(() => {
    if (answered) {
      setIsAnswered(true);
    }
    if (selectedAnswer) {
      setSubmittedText(selectedAnswer);
    }
  }, [answered, selectedAnswer]);

  const handleSubmit = async () => {
    if (submitting || isAnswered) return;

    let text = "";
    if (selectedIndex === "custom") {
      text = customText.trim();
    } else if (typeof selectedIndex === "number" && options[selectedIndex]) {
      text = options[selectedIndex];
    }

    if (!text) return;

    setSubmitting(true);
    try {
      await onAnswerSubmit(questionId, text);
      setSubmittedText(text);
      setIsAnswered(true);
    } catch (err) {
      console.error("Failed to submit answer:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isAnswered) {
    return (
      <div className="bg-zinc-900/90 border border-violet-500/20 text-zinc-300 p-4 rounded-2xl rounded-bl-md max-w-[92%] text-[13px] space-y-2 shadow-lg">
        <div className="flex items-center gap-2 text-violet-400 font-medium text-[12px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Clarification Answered
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

  return (
    <div className="bg-zinc-950/90 border border-violet-500/30 text-zinc-200 p-4.5 rounded-2xl rounded-bl-md max-w-[92%] text-[13px] space-y-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-violet-400 font-mono">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Design Decision Needed
        </span>
      </div>

      {/* Question prompt */}
      <p className="font-medium text-white text-[13.5px] leading-relaxed">{question}</p>

      {/* Options list */}
      <div className="space-y-2">
        {options.map((opt, idx) => {
          const isRecommended = idx === recommended;
          const isSelected = selectedIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
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
                    isSelected ? "border-violet-400 bg-violet-500 text-white" : "border-zinc-600 bg-transparent"
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className="text-[12.5px] font-medium leading-snug">{opt}</span>
              </div>

              {isRecommended && (
                <span className="shrink-0 text-[10px] font-semibold text-violet-300 bg-violet-500/20 border border-violet-500/40 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  Recommended
                </span>
              )}
            </button>
          );
        })}

        {/* Custom answer option */}
        <div
          onClick={() => setSelectedIndex("custom")}
          className={`p-3 rounded-xl cursor-pointer transition-all border ${
            selectedIndex === "custom"
              ? "bg-violet-600/15 border-violet-500 text-white shadow-sm shadow-violet-500/10"
              : "bg-white/[0.02] border-white/8 hover:border-white/20 text-zinc-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                selectedIndex === "custom" ? "border-violet-400 bg-violet-500 text-white" : "border-zinc-600 bg-transparent"
              }`}
            >
              {selectedIndex === "custom" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <span className="text-[12.5px] font-medium text-zinc-200">Other (Custom Answer)</span>
          </div>

          {selectedIndex === "custom" && (
            <div className="mt-2.5 pl-6.5">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type your preferred design or requirement..."
                className="w-full bg-black/40 border border-white/12 focus:border-violet-500 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-zinc-500 outline-none transition-colors"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit button */}
      <div className="pt-1 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            submitting ||
            selectedIndex === null ||
            (selectedIndex === "custom" && !customText.trim())
          }
          className="px-4 py-2 cursor-pointer rounded-xl bg-violet-600 text-white hover:bg-violet-500 active:scale-95 text-[12px] font-semibold tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2 shadow-md shadow-violet-600/20"
        >
          {submitting ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Choice
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
