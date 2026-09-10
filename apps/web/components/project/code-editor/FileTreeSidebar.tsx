"use client";

import { useState } from "react";
import { ProjectFile } from "./mock-project-files";
import { FileIcon, FolderIcon } from "./FileIcons";
import { ChevronDown, ChevronRight, Code } from "lucide-react";

interface FileTreeSidebarProps {
  files: ProjectFile[];
  activeFile: ProjectFile;
  onSelectFile: (file: ProjectFile) => void;
}

export default function FileTreeSidebar({
  files,
  activeFile,
  onSelectFile,
}: FileTreeSidebarProps) {
  // Folders collapsed state
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    app: true,
    components: true,
    lib: true,
  });

  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  // Group files by folder
  const folders = Array.from(
    new Set(files.map((f) => f.folder).filter(Boolean) as string[])
  );
  const rootFiles = files.filter((f) => !f.folder);

  return (
    <aside className="w-60 shrink-0 h-full bg-[#0a0a0d] border-r border-white/6 flex flex-col select-none overflow-hidden">
      {/* Codebar Header */}
      <div className="h-9 px-3.5 border-b border-white/6 flex items-center justify-between shrink-0 bg-black/40">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-zinc-500" />
          Editor
        </span>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto py-2 px-1 text-xs space-y-0.5 font-mono">
        {/* Folders */}
        {folders.map((folderName) => {
          const folderFiles = files.filter((f) => f.folder === folderName);
          const isOpen = openFolders[folderName] ?? true;

          return (
            <div key={folderName} className="space-y-0.5">
              {/* Folder Row */}
              <button
                type="button"
                onClick={() => toggleFolder(folderName)}
                className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/4 transition-colors cursor-pointer text-left"
              >
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
                )}
                <FolderIcon isOpen={isOpen} />
                <span className="font-semibold text-zinc-300 text-[12px]">
                  {folderName}
                </span>
              </button>

              {/* Folder Children */}
              {isOpen && (
                <div className="pl-4 space-y-0.5">
                  {folderFiles.map((file) => {
                    const isActive = activeFile.id === file.id;
                    return (
                      <button
                        type="button"
                        key={file.id}
                        onClick={() => onSelectFile(file)}
                        className={`w-full flex items-center gap-2 px-2 py-1 rounded-md transition-all cursor-pointer text-left text-[12px] ${
                          isActive
                            ? "bg-white/10 text-white font-medium shadow-xs"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-white/4"
                        }`}
                      >
                        <div className="w-4 flex items-center justify-center">
                          <FileIcon fileName={file.name} />
                        </div>
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Root Files */}
        <div className="pt-2 border-t border-white/4 mt-2">
          {rootFiles.map((file) => {
            const isActive = activeFile.id === file.id;
            return (
              <button
                type="button"
                key={file.id}
                onClick={() => onSelectFile(file)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded-md transition-all cursor-pointer text-left text-[12px] ${
                  isActive
                    ? "bg-white/10 text-white font-medium shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/4"
                }`}
              >
                <div className="w-4 flex items-center justify-center">
                  <FileIcon fileName={file.name} />
                </div>
                <span className="truncate">{file.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
