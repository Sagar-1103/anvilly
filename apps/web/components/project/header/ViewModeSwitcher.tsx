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
    <div className="flex p-0.5 rounded-lg bg-[#242428] border border-[#35353c]">
      {(["preview", "code"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setActiveTab(v)}
          className={`px-2.5 cursor-pointer py-1 rounded-md text-[11px] font-semibold capitalize flex items-center gap-1.5 transition-all ${
            activeTab === v
              ? "bg-[#34343a] text-white shadow-xs"
              : "text-zinc-400 hover:text-zinc-200"
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
