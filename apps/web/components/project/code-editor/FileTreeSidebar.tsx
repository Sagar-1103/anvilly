"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Code } from "lucide-react";
import type { FileTreeNode } from "@/lib/types";
import { FileIcon, FolderIcon } from "./FileIcons";

interface FileTreeSidebarProps {
  fileTree: FileTreeNode[];
  activeFilePath: string | null;
  recentlyChanged: Map<string, "new" | "modified">;
  onSelectFile: (path: string) => void;
}

/* ─── Recursive tree node ─── */
function FileTreeNodeItem({
  node,
  depth,
  activeFilePath,
  recentlyChanged,
  onSelectFile,
}: {
  node: FileTreeNode;
  depth: number;
  activeFilePath: string | null;
  recentlyChanged: Map<string, "new" | "modified">;
  onSelectFile: (path: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(depth < 2);

  if (node.isDirectory) {
    return (
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-1.5 py-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/4 transition-colors cursor-pointer text-left"
          style={{ paddingLeft: `${depth * 12 + 8}px`, paddingRight: "8px" }}
        >
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
          )}
          <FolderIcon isOpen={isOpen} />
          <span className="font-semibold text-zinc-300 text-[12px] truncate">
            {node.name}
          </span>
        </button>

        {isOpen && node.children && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <FileTreeNodeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFilePath={activeFilePath}
                recentlyChanged={recentlyChanged}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ─── File node ─── */
  const isActive = activeFilePath === node.path;
  const changeType = recentlyChanged.get(node.path);

  return (
    <button
      type="button"
      onClick={() => onSelectFile(node.path)}
      className={`w-full flex items-center gap-2 py-1 rounded-md transition-all cursor-pointer text-left text-[12px] ${
        isActive
          ? "bg-white/10 text-white font-medium shadow-xs"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/4"
      }`}
      style={{ paddingLeft: `${depth * 12 + 8}px`, paddingRight: "8px" }}
    >
      <div className="w-4 flex items-center justify-center shrink-0">
        <FileIcon fileName={node.name} />
      </div>
      <span className="truncate flex-1">{node.name}</span>
      {changeType && (
        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-all duration-300 ${
            changeType === "new"
              ? "bg-emerald-500/15 text-emerald-400 animate-in fade-in zoom-in-95 duration-300"
              : "bg-amber-500/15 text-amber-400 animate-in fade-in zoom-in-95 duration-300"
          }`}
        >
          {changeType === "new" ? "new" : "mod"}
        </span>
      )}
    </button>
  );
}

/* ─── Sidebar ─── */
export default function FileTreeSidebar({
  fileTree,
  activeFilePath,
  recentlyChanged,
  onSelectFile,
}: FileTreeSidebarProps) {
  return (
    <aside className="w-60 shrink-0 h-full bg-[#0a0a0d] border-r border-white/6 flex flex-col select-none overflow-hidden">
      {/* Header */}
      <div className="h-9 px-3.5 border-b border-white/6 flex items-center justify-between shrink-0 bg-black/40">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-zinc-500" />
          Explorer
        </span>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto py-2 px-1 text-xs space-y-0.5 font-mono">
        {fileTree.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-[11px] text-zinc-600">No files yet</p>
          </div>
        ) : (
          fileTree.map((node) => (
            <FileTreeNodeItem
              key={node.path}
              node={node}
              depth={0}
              activeFilePath={activeFilePath}
              recentlyChanged={recentlyChanged}
              onSelectFile={onSelectFile}
            />
          ))
        )}
      </div>
    </aside>
  );
}
