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
          ? "bg-[#391e66] border-[#6366f1] text-purple-100 shadow-sm shadow-indigo-500/20"
          : "bg-[#232328] border-white/10 hover:border-white/20 text-zinc-300"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
            isSelected
              ? "border-purple-400 bg-[#6366f1] text-white"
              : "border-zinc-500 bg-transparent"
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
            className="w-full bg-[#18181b] border border-white/15 focus:border-[#6366f1] rounded-lg px-3 py-2 text-[12px] text-white placeholder:text-zinc-500 outline-none transition-colors"
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
