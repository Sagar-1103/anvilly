"use client";

import { ChevronRight, Folder } from "lucide-react";
import { ProjectFile } from "./mock-project-files";
import { FileIcon } from "./FileIcons";

interface EditorBreadcrumbsProps {
  activeFile: ProjectFile;
}

export default function EditorBreadcrumbs({ activeFile }: EditorBreadcrumbsProps) {
  return (
    <div className="h-6 bg-[#18181b] border-b border-white/6 px-3 flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 overflow-x-auto no-scrollbar shrink-0 select-none">
      <span className="hover:text-zinc-300 transition-colors cursor-pointer text-zinc-400">
        anvilly-app
      </span>

      {activeFile.folder && (
        <>
          <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
          <span className="hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1 text-zinc-400">
            <Folder className="w-3 h-3 text-amber-400/80" />
            <span>{activeFile.folder}</span>
          </span>
        </>
      )}

      <ChevronRight className="w-3 h-3 text-zinc-600 shrink-0" />
      <span className="hover:text-zinc-300 transition-colors cursor-pointer flex items-center gap-1 text-zinc-300 font-medium">
        <FileIcon fileName={activeFile.name} />
        <span>{activeFile.name}</span>
      </span>
    </div>
  );
}
