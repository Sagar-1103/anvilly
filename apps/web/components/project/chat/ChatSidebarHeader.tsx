"use client";

import Link from "next/link";
import { SidebarHeader } from "@/components/ui/sidebar";

interface ChatSidebarHeaderProps {
  title?: string | null;
}

export default function ChatSidebarHeader({ title }: ChatSidebarHeaderProps) {
  return (
    <SidebarHeader className="h-12 px-4 flex flex-row items-center gap-3 border-b border-[#27272b] shrink-0 bg-[#18181b]">
      <Link href="/" className="shrink-0 group">
        <span className="text-[15px] font-black tracking-tight font-mono text-white group-hover:text-zinc-300 transition-colors">
          anvilly
        </span>
      </Link>
      <span className="h-3.5 w-px bg-zinc-700/60" />
      <p className="text-[13px] font-medium text-zinc-100 transition-colors truncate">
        {title || "Untitled Project"}
      </p>
    </SidebarHeader>
  );
}
