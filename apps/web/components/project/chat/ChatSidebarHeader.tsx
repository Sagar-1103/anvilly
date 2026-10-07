"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { SidebarHeader } from "@/components/ui/sidebar";

interface ChatSidebarHeaderProps {
  title?: string | null;
  onEdit?: () => void;
}

export default function ChatSidebarHeader({ title, onEdit }: ChatSidebarHeaderProps) {
  return (
    <SidebarHeader className="h-12 px-4 flex flex-row items-center gap-3 border-b border-[#27272b] shrink-0 bg-[#18181b]">
      <Link href="/" className="shrink-0 group">
        <span className="text-[15px] font-black tracking-tight font-mono text-white group-hover:text-zinc-300 transition-colors">
          anvilly
        </span>
      </Link>
      <span className="h-3.5 w-px bg-zinc-700/60" />
      <div className="flex items-center gap-1.5 min-w-0 flex-1 group">
        <p className="text-[13px] font-medium text-zinc-100 transition-colors truncate">
          {title || "Untitled Project"}
        </p>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1 text-zinc-500 hover:text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer shrink-0 opacity-70 group-hover:opacity-100"
            title="Edit project details"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </SidebarHeader>
  );
}
