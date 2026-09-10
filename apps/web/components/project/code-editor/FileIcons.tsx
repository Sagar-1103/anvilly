"use client";

import React from "react";
import { Folder, FolderOpen, FileText, FileCode2 } from "lucide-react";

interface FileIconProps {
  fileName: string;
  className?: string;
}

export function FileIcon({ fileName, className = "" }: FileIconProps) {
  const lowerName = fileName.toLowerCase();

  // TSX / React
  if (lowerName.endsWith(".tsx") || lowerName.endsWith(".jsx")) {
    return (
      <span
        className={`inline-flex items-center justify-center w-3.5 h-3.5 text-sky-400 font-mono text-[10px] font-bold select-none ${className}`}
        title="React Component"
      >
        TSX
      </span>
    );
  }

  // TypeScript
  if (lowerName.endsWith(".ts")) {
    return (
      <span
        className={`inline-flex items-center justify-center w-3.5 h-3.5 text-blue-400 font-mono text-[10px] font-bold select-none ${className}`}
        title="TypeScript"
      >
        TS
      </span>
    );
  }

  // CSS
  if (lowerName.endsWith(".css")) {
    return (
      <span
        className={`inline-flex items-center justify-center w-3.5 h-3.5 text-indigo-400 font-mono text-[10px] font-bold select-none ${className}`}
        title="CSS"
      >
        #
      </span>
    );
  }

  // JSON
  if (lowerName.endsWith(".json")) {
    return (
      <span
        className={`inline-flex items-center justify-center w-3.5 h-3.5 text-amber-400 font-mono text-[10px] font-bold select-none ${className}`}
        title="JSON"
      >
        &#123;&#125;
      </span>
    );
  }

  // Markdown
  if (lowerName.endsWith(".md") || lowerName.endsWith(".mdx")) {
    return (
      <span
        className={`inline-flex items-center justify-center w-3.5 h-3.5 text-zinc-400 font-mono text-[10px] font-bold select-none ${className}`}
        title="Markdown"
      >
        MD
      </span>
    );
  }

  // HTML / SVG
  if (lowerName.endsWith(".html") || lowerName.endsWith(".svg")) {
    return <FileCode2 className={`w-3.5 h-3.5 text-orange-400 ${className}`} />;
  }

  // Default
  return <FileText className={`w-3.5 h-3.5 text-zinc-400 ${className}`} />;
}

export function FolderIcon({ isOpen }: { isOpen: boolean }) {
  if (isOpen) {
    return <FolderOpen className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />;
  }
  return <Folder className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />;
}
