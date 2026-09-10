"use client";

import { X } from "lucide-react";

interface AuthModalHeaderProps {
  onClose: () => void;
  disabled?: boolean;
}

export default function AuthModalHeader({
  onClose,
  disabled = false,
}: AuthModalHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 mb-2 border-b border-zinc-900">
      <div className="flex items-center gap-2">
        <span className="text-base font-extrabold tracking-tighter text-white font-mono">
          anvilly
        </span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onClose}
        className="p-1 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        title="Close modal"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
