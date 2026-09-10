"use client";

import { SidebarFooter } from "@/components/ui/sidebar";
import { Plus, ArrowUp } from "lucide-react";

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
  return (
    <SidebarFooter className="p-0! border-t border-white/6 bg-black">
      <div className="p-3">
        <form
          onSubmit={onSubmit}
          className="bg-white/3 border border-white/6 rounded-xl p-3 flex flex-col min-h-24 focus-within:border-white/12 transition-colors"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
            disabled={busy}
            placeholder="Ask Anvilly..."
            rows={2}
            className="flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed disabled:opacity-50"
          />

          <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/4">
            <button
              type="button"
              disabled={busy}
              className="w-6 h-6 cursor-pointer rounded-md bg-white/4 border border-white/6 text-zinc-500 hover:text-white flex items-center justify-center transition-colors disabled:opacity-50"
              title="Add attachment"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!prompt.trim() || busy}
                className="w-6 h-6 cursor-pointer rounded-lg bg-white text-black flex items-center justify-center disabled:opacity-20 hover:bg-zinc-200 transition-colors"
                title="Send message"
              >
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </SidebarFooter>
  );
}
