"use client";

import { ChevronRight, Folder } from "lucide-react";
import type { SandboxFile } from "@/lib/types";
import { FileIcon } from "./FileIcons";

interface EditorBreadcrumbsProps {
  activeFile: SandboxFile;
}

export default function EditorBreadcrumbs({ activeFile }: EditorBreadcrumbsProps) {
  const pathSegments = activeFile.path.split("/");
  const folderSegments = pathSegments.slice(0, -1);

  return (
    <div className="h-6 bg-[#18181b] border-b border-white/6 px-3 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 overflow-x-auto no-scrollbar shrink-0 select-none">
      <span className="hover:text-zinc-300 transition-colors cursor-pointer text-zinc-400">
        anvilly-app
      </span>

      {folderSegments.map((segment, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
          <span className="hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1 text-zinc-400">
            <Folder className="w-3 h-3 text-amber-400/80" />
            <span>{segment}</span>
          </span>
        </span>
      ))}

      <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
      <span className="hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1 text-zinc-300 font-medium">
        <FileIcon fileName={activeFile.name} />
        <span>{activeFile.name}</span>
      </span>
    </div>
  );
}
