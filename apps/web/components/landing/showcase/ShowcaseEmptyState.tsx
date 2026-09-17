"use client";

import { Sparkles, Code2, Plus, SearchX, RotateCcw, Smartphone, Layout } from "lucide-react";
import { ShowcaseTabType } from "./types";

interface ShowcaseEmptyStateProps {
  searchQuery?: string;
  activeTab?: ShowcaseTabType;
  onClearSearch?: () => void;
  onSelectTab?: (tab: ShowcaseTabType) => void;
}

export default function ShowcaseEmptyState({
  searchQuery,
  activeTab,
  onClearSearch,
  onSelectTab,
}: ShowcaseEmptyStateProps) {
  const isSearchActive = Boolean(searchQuery && searchQuery.trim().length > 0);

  const handleScrollToForge = () => {
    const input = document.getElementById("hero-prompt-input");
    if (input) {
      input.scrollIntoView({ behavior: "smooth", block: "center" });
      input.focus();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // 1. Search Query Filter Empty State
  if (isSearchActive) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-linear-to-b from-zinc-900/40 via-zinc-950/60 to-black p-8 sm:p-12 text-center shadow-2xl backdrop-blur-sm animate-fade-in">
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 hero-grid pointer-events-none opacity-25" />

        {/* Layered glowing badge */}
        <div className="relative z-10 flex justify-center mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-b from-zinc-800/90 to-zinc-900/90 border border-white/10 flex items-center justify-center text-white shadow-2xl shadow-black/80">
              <SearchX className="w-7 h-7 text-indigo-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
              <RotateCcw className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Headline and Description */}
        <div className="relative z-10 space-y-2 max-w-md mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            No projects found
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            No projects match &ldquo;<span className="text-zinc-200 font-medium">{searchQuery}</span>&rdquo;. Check your spelling or clear the filter.
          </p>
        </div>

        {/* Primary Action Button */}
        {onClearSearch && (
          <div className="relative z-10 pt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClearSearch}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Search Filter</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. Tab Filter Empty State (Mobile Apps / Web Apps)
  if (activeTab === "Mobile Apps" || activeTab === "Web Apps") {
    const isMobile = activeTab === "Mobile Apps";
    return (
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-linear-to-b from-zinc-900/40 via-zinc-950/60 to-black p-8 sm:p-12 text-center shadow-2xl backdrop-blur-sm animate-fade-in">
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute inset-0 hero-grid pointer-events-none opacity-25" />

        {/* Layered glowing badge */}
        <div className="relative z-10 flex justify-center mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-b from-zinc-800/90 to-zinc-900/90 border border-white/10 flex items-center justify-center text-white shadow-2xl shadow-black/80">
              {isMobile ? (
                <Smartphone className="w-7 h-7 text-indigo-400" />
              ) : (
                <Layout className="w-7 h-7 text-indigo-400" />
              )}
            </div>
          </div>
        </div>

        {/* Headline and Description */}
        <div className="relative z-10 space-y-2 max-w-md mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {isMobile ? "No mobile apps yet" : "No web apps yet"}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            {isMobile
              ? "Create your first React Native Expo mobile project using the prompt box above."
              : "Create your first React web project using the prompt box above."}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="relative z-10 pt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleScrollToForge}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create {isMobile ? "Mobile App" : "Web App"}</span>
          </button>
          {onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab("All Projects")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-zinc-300 font-semibold text-xs hover:bg-zinc-800 active:scale-[0.98] transition-all border border-zinc-800 cursor-pointer"
            >
              <span>View All Projects</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Default: Zero Projects in All Projects / My Projects
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-linear-to-b from-zinc-900/40 via-zinc-950/60 to-black p-8 sm:p-12 text-center shadow-2xl backdrop-blur-sm animate-fade-in">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 hero-grid pointer-events-none opacity-25" />

      {/* Layered glowing badge */}
      <div className="relative z-10 flex justify-center mb-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-b from-zinc-800/90 to-zinc-900/90 border border-white/10 flex items-center justify-center text-white shadow-2xl shadow-black/80">
            <Sparkles className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
            <Code2 className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Headline and Description */}
      <div className="relative z-10 space-y-2 max-w-md mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Your workspace is ready
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          You haven&rsquo;t forged any projects yet. Enter a prompt in the forge above to turn your vision into a live, interactive application.
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="relative z-10 pt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleScrollToForge}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-xl shadow-white/5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Your First Project</span>
        </button>
      </div>
    </div>
  );
}
