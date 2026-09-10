"use client";

import { Search } from "lucide-react";

interface ShowcaseHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ShowcaseHeader({
  searchQuery,
  setSearchQuery,
}: ShowcaseHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-zinc-900">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          Explore Your Projects
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Manage and inspect all full-stack applications forged by you on Anvilly.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full md:w-72">
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 pl-9 pr-4 py-2.5 focus:outline-none focus:border-zinc-700 transition-colors"
        />
      </div>
    </div>
  );
}
