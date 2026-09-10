"use client";

interface QuestionCustomInputProps {
  isSelected: boolean;
  customText: string;
  disabled?: boolean;
  onSelect: () => void;
  onTextChange: (text: string) => void;
}

export default function QuestionCustomInput({
  isSelected,
  customText,
  disabled = false,
  onSelect,
  onTextChange,
}: QuestionCustomInputProps) {
  return (
    <div
      onClick={() => {
        if (!disabled) onSelect();
      }}
      className={`p-3 rounded-xl cursor-pointer transition-all border ${
        isSelected
          ? "bg-violet-600/15 border-violet-500 text-white shadow-sm shadow-violet-500/10"
          : "bg-white/[0.02] border-white/8 hover:border-white/20 text-zinc-300"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
            isSelected
              ? "border-violet-400 bg-violet-500 text-white"
              : "border-zinc-600 bg-transparent"
          }`}
        >
          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
        </span>
        <span className="text-[12.5px] font-medium text-zinc-200">Other (Custom Answer)</span>
      </div>

      {isSelected && (
        <div className="mt-2.5 pl-6.5">
          <input
            type="text"
            value={customText}
            onChange={(e) => onTextChange(e.target.value)}
            disabled={disabled}
            placeholder="Type your preferred design or requirement..."
            className="w-full bg-black/40 border border-white/12 focus:border-violet-500 rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-zinc-500 outline-none transition-colors"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
