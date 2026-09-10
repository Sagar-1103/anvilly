"use client";

import { useEffect, useState } from "react";
import { QuestionPayload } from "@/lib/types";
import { HelpCircle, ArrowRight, Loader2 } from "lucide-react";
import QuestionCardAnswered from "./question/QuestionCardAnswered";
import QuestionOptionItem from "./question/QuestionOptionItem";
import QuestionCustomInput from "./question/QuestionCustomInput";

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
      <QuestionCardAnswered
        question={question}
        submittedText={submittedText}
      />
    );
  }

  return (
    <div className="bg-zinc-950/90 border border-violet-500/30 text-zinc-200 p-4.5 rounded-2xl rounded-bl-md max-w-[92%] text-[13px] space-y-3.5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/6 pb-2.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase text-violet-400 font-mono">
          <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          Design Decision Needed
        </span>
      </div>

      {/* Question prompt */}
      <p className="font-medium text-white text-[13.5px] leading-relaxed">
        {question}
      </p>

      {/* Options list */}
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <QuestionOptionItem
            key={idx}
            option={opt}
            index={idx}
            isSelected={selectedIndex === idx}
            isRecommended={idx === recommended}
            disabled={submitting}
            onSelect={setSelectedIndex}
          />
        ))}

        {/* Custom answer option */}
        <QuestionCustomInput
          isSelected={selectedIndex === "custom"}
          customText={customText}
          disabled={submitting}
          onSelect={() => setSelectedIndex("custom")}
          onTextChange={setCustomText}
        />
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
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit Choice
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
