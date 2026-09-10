"use client";

import { Eye, Code2 } from "lucide-react";

interface ViewModeSwitcherProps {
  activeTab: "preview" | "code";
  setActiveTab: (tab: "preview" | "code") => void;
}

export default function ViewModeSwitcher({
  activeTab,
  setActiveTab,
}: ViewModeSwitcherProps) {
  return (
    <div className="flex p-0.5 rounded-lg bg-white/4 border border-white/6">
      {(["preview", "code"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setActiveTab(v)}
          className={`px-2.5 cursor-pointer py-1 rounded-md text-[11px] font-semibold capitalize flex items-center gap-1.5 transition-all ${
            activeTab === v
              ? "bg-white/8 text-white"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          {v === "preview" ? (
            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <Code2 className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          {v === "preview" ? "Preview" : "Code"}
        </button>
      ))}
    </div>
  );
}
