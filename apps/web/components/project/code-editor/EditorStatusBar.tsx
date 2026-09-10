"use client";

import { ProjectFile } from "./mock-project-files";

interface EditorStatusBarProps {
  activeFile: ProjectFile;
  lineCount: number;
}

export default function EditorStatusBar({
  activeFile,
  lineCount,
}: EditorStatusBarProps) {
  return (
    <div className="h-6 bg-[#0f0f12] border-t border-white/6 px-3 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0 select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {activeFile.name}
        </span>
        <span>{lineCount} lines</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="capitalize">{activeFile.language}</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
