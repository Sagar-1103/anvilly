"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { BackendProject } from "./types";

interface ProjectCardMenuProps {
  project: BackendProject;
  isOpen: boolean;
  onToggle: () => void;
  onSelectEdit: () => void;
  onSelectDelete: () => void;
}

export default function ProjectCardMenu({
  isOpen,
  onToggle,
  onSelectEdit,
  onSelectDelete,
}: ProjectCardMenuProps) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-7 z-50 w-44 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.9),0_0_12px_rgba(0,0,0,0.5)] ring-1 ring-white/10 p-1.5 animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectEdit();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-zinc-400" />
            <span>Edit Details</span>
          </button>

          <div className="my-1 border-t border-zinc-800/80" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectDelete();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Project</span>
          </button>
        </div>
      )}
    </div>
  );
}
