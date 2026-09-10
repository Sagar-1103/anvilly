"use client";

import { ProjectFile } from "./mock-project-files";
import { X } from "lucide-react";
import { FileIcon } from "./FileIcons";
import EditorBreadcrumbs from "./EditorBreadcrumbs";

interface EditorTabBarProps {
  openTabs: ProjectFile[];
  activeFile: ProjectFile;
  onSelectTab: (file: ProjectFile) => void;
  onCloseTab: (fileId: string) => void;
}

export default function EditorTabBar({
  openTabs,
  activeFile,
  onSelectTab,
  onCloseTab,
}: EditorTabBarProps) {
  return (
    <div className="flex flex-col shrink-0 select-none">
      {/* Tab Row */}
      <div className="h-9 bg-[#111114] border-b border-white/6 flex items-center justify-between px-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar h-full">
          {openTabs.map((file) => {
            const isActive = file.id === activeFile.id;
            return (
              <div
                key={file.id}
                onClick={() => onSelectTab(file)}
                className={`group h-7 px-3 rounded-md flex items-center gap-2 text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1e1e1e] text-white border border-white/10 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/4"
                }`}
              >
                <FileIcon fileName={file.name} />
                <span className="text-[12px]">{file.name}</span>

                {openTabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(file.id);
                    }}
                    className="w-3.5 h-3.5 rounded hover:bg-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Breadcrumbs Row */}
      <EditorBreadcrumbs activeFile={activeFile} />
    </div>
  );
}
