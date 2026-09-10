"use client";

import Link from "next/link";
import { SidebarHeader } from "@/components/ui/sidebar";

interface ChatSidebarHeaderProps {
  title?: string | null;
}

export default function ChatSidebarHeader({ title }: ChatSidebarHeaderProps) {
  return (
    <SidebarHeader className="h-12 px-4 flex flex-row items-center gap-3 border-b border-white/6 shrink-0 bg-black">
      <Link href="/" className="shrink-0 group">
        <span className="text-[15px] font-extrabold tracking-tighter font-mono text-white group-hover:opacity-85 transition-opacity">
          anvilly
        </span>
      </Link>
      <span className="h-4 w-0.5 bg-white/10" />
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-white transition-colors truncate">
        {title || "Untitled Project"}
      </p>
    </SidebarHeader>
  );
}
