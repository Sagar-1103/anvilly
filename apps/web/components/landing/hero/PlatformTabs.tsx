"use client";

import { Smartphone, Layout } from "lucide-react";

interface PlatformTabsProps {
  activeTab: "mobile" | "web";
  setActiveTab: (tab: "mobile" | "web") => void;
}

export default function PlatformTabs({
  activeTab,
  setActiveTab,
}: PlatformTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/60">
      <button
        type="button"
        onClick={() => setActiveTab("mobile")}
        className={`flex items-center cursor-pointer gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          activeTab === "mobile"
            ? "bg-zinc-800 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" strokeWidth={2.2} />
        Mobile app
      </button>
      <button
        type="button"
        onClick={() => setActiveTab("web")}
        className={`flex items-center cursor-pointer gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
          activeTab === "web"
            ? "bg-zinc-800 text-white shadow-sm"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Layout className="w-3.5 h-3.5" strokeWidth={2.2} />
        Landing Page
      </button>
    </div>
  );
}
