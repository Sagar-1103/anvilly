"use client";

import PlatformTabs from "./PlatformTabs";
import SuggestionChips, { SuggestionItem } from "./SuggestionChips";
import GenerateButton from "./GenerateButton";

interface PromptCardProps {
  promptValue: string;
  setPromptValue: (val: string) => void;
  activeTab: "mobile" | "web";
  setActiveTab: (tab: "mobile" | "web") => void;
  isLoading: boolean;
  quickSuggestions: (string | SuggestionItem)[];
  onSendPrompt: (e?: React.FormEvent | React.KeyboardEvent) => void;
}

export default function PromptCard({
  promptValue,
  setPromptValue,
  activeTab,
  setActiveTab,
  isLoading,
  quickSuggestions,
  onSendPrompt,
}: PromptCardProps) {
  return (
    <div className="relative z-10 mt-14 w-full max-w-2xl animate-fade-in-up stagger-3">
      <div className="relative group rounded-3xl p-0.5 bg-linear-to-b from-violet-500/50 via-zinc-800/30 to-zinc-800/60 shadow-2xl shadow-black/80 transition-all duration-300 hover:from-violet-500/60 focus-within:from-violet-500/65 focus-within:to-zinc-800/60">
        <div className="bg-[#08070c]/90 rounded-[22px] p-4 backdrop-blur-xl border border-zinc-800/70 flex flex-col justify-between min-h-52.5">
          {/* Top Bar: Platform Selector */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/40">
            <PlatformTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Main Textarea */}
          <textarea
            id="hero-prompt-input"
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendPrompt(e);
              }
            }}
            disabled={isLoading}
            placeholder={
              activeTab === "mobile"
                ? "Build a mobile habit tracker app with streak calendar and daily goals..."
                : "Build a modern developer portfolio with an interactive project showcase..."
            }
            rows={3}
            className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 text-sm sm:text-base px-2 py-1 resize-none focus:outline-none leading-relaxed disabled:opacity-60"
          />

          {/* Quick Chips Suggestion Row */}
          {!promptValue && (
            <SuggestionChips
              suggestions={quickSuggestions}
              isLoading={isLoading}
              onSelectSuggestion={setPromptValue}
            />
          )}

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/40">
            <div className="flex items-center gap-2">
              {promptValue && (
                <button
                  type="button"
                  onClick={() => setPromptValue("")}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer px-1 py-0.5"
                >
                  Clear prompt
                </button>
              )}
            </div>

            <GenerateButton
              isLoading={isLoading}
              disabled={isLoading || !promptValue.trim()}
              onClick={onSendPrompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

