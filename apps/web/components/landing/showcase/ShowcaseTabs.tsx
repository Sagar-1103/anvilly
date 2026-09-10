"use client";

import { SHOWCASE_TABS, ShowcaseTabType } from "./types";

interface ShowcaseTabsProps {
  activeTab: ShowcaseTabType;
  setActiveTab: (tab: ShowcaseTabType) => void;
}

export default function ShowcaseTabs({
  activeTab,
  setActiveTab,
}: ShowcaseTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 w-fit mb-8">
      {SHOWCASE_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === tab
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 cursor-pointer"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
