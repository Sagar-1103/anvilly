"use client";

interface SuggestionChipsProps {
  suggestions: string[];
  isLoading: boolean;
  onSelectSuggestion: (suggestion: string) => void;
}

export default function SuggestionChips({
  suggestions,
  isLoading,
  onSelectSuggestion,
}: SuggestionChipsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          disabled={isLoading}
          onClick={() => onSelectSuggestion(suggestion)}
          className="shrink-0 cursor-pointer px-2.5 py-1 rounded-md bg-zinc-900/50 hover:bg-zinc-800 text-[11px] text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + {suggestion}
        </button>
      ))}
    </div>
  );
}
