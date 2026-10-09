"use client";

import { SidebarFooter } from "@/components/ui/sidebar";
import { ArrowUp } from "lucide-react";
import ModelSelectorChip from "@/components/shared/ModelSelectorChip";
import { useCredentials } from "@/contexts/credential-context";
import { toast } from "sonner";

interface ChatPromptInputProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  busy: boolean;
}

export default function ChatPromptInput({
  prompt,
  setPrompt,
  onSubmit,
  busy,
}: ChatPromptInputProps) {
  const { hasModel, openModal } = useCredentials();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!hasModel) {
        toast.error("Please configure an API key in your Vault before generating.");
        openModal();
        return;
      }
      onSubmit();
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasModel) {
      toast.error("Please configure an API key in your Vault before generating.");
      openModal();
      return;
    }
    onSubmit(e);
  };

  return (
    <SidebarFooter className="p-0! border-t border-[#27272b] bg-[#18181b]">
      <div className="p-3">
        <form
          onSubmit={handleFormSubmit}
          className="bg-[#242428] border border-[#35353c] hover:border-[#44444c] focus-within:border-[#5856d6]/60 focus-within:ring-2 focus-within:ring-[#5856d6]/20 rounded-2xl p-3 flex flex-col min-h-24 shadow-xl shadow-black/30 transition-all"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            placeholder={
              hasModel
                ? "Describe what to build or change..."
                : "Add an API key below to start building..."
            }
            rows={2}
            className="flex-1 bg-transparent text-[13px] text-zinc-100 placeholder:text-zinc-500 resize-none outline-none leading-relaxed disabled:opacity-50 min-h-[44px]"
          />

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40 mt-1">
            <ModelSelectorChip size="sm" />

            <button
              type="submit"
              disabled={!prompt.trim() || busy || !hasModel}
              className="w-7 h-7 cursor-pointer rounded-full bg-[#5856d6] hover:bg-[#6866e4] active:scale-95 text-white flex items-center justify-center disabled:opacity-30 disabled:hover:bg-[#5856d6] disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 transition-all"
              title={
                !hasModel
                  ? "Add an API key to send messages"
                  : "Send message"
              }
            >
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </form>
      </div>
    </SidebarFooter>
  );
}
