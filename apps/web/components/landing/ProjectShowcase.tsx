"use client";

import { useState } from "react";

interface Project {
  id: string;
  title: string;
  description: string;
  type: "All Projects" | "My Projects" | "Shared Projects";
  author: {
    name: string;
    avatar: string;
  };
  updatedAt: string;
  tags: string[];
  gradient: string;
}

const tabs = ["All Projects", "My Projects", "Shared Projects"] as const;

const projects: Project[] = [
  {
    id: "1",
    title: "MetricsPulse - Analytics Hub",
    description: "Real-time SaaS telemetry dashboard with interactive charts, user funnel breakdown, and custom alerts.",
    type: "My Projects",
    author: { name: "You", avatar: "Y" },
    updatedAt: "2 mins ago",
    tags: ["React", "Tailwind", "Tremor"],
    gradient: "from-zinc-800 to-zinc-900",
  },
  {
    id: "2",
    title: "CognitiveFlow - AI Writer",
    description: "Minimalist workspace for AI content generation with streaming output, prompt templates, and PDF export.",
    type: "My Projects",
    author: { name: "You", avatar: "Y" },
    updatedAt: "1 hour ago",
    tags: ["Next.js", "OpenAI", "Prisma"],
    gradient: "from-zinc-900 to-zinc-950",
  },
  {
    id: "3",
    title: "AuraStore - Headless Shop",
    description: "Ultra-fast modern ecommerce storefront featuring slick motion transitions, cart side-sheet, and Stripe checkout.",
    type: "Shared Projects",
    author: { name: "sarah_m", avatar: "S" },
    updatedAt: "3 hours ago",
    tags: ["Shadcn", "Stripe", "Framer"],
    gradient: "from-zinc-800 to-zinc-900",
  },
  {
    id: "4",
    title: "TaskForge - Kanban Studio",
    description: "Collaborative project management tool with drag-and-drop boards, task assignment, and real-time sync.",
    type: "Shared Projects",
    author: { name: "kenji_k", avatar: "K" },
    updatedAt: "Yesterday",
    tags: ["TypeScript", "Zustand", "Dnd"],
    gradient: "from-zinc-900 to-zinc-950",
  },
  {
    id: "5",
    title: "Verve - Developer Portfolio",
    description: "Dark-themed minimalist personal website featuring MDX blog engine, GitHub activity feed, and terminal modal.",
    type: "My Projects",
    author: { name: "You", avatar: "Y" },
    updatedAt: "2 days ago",
    tags: ["MDX", "Tailwind", "Vercel"],
    gradient: "from-zinc-800 to-zinc-900",
  },
  {
    id: "6",
    title: "Nexus - API Documentation",
    description: "Interactive API reference portal with live endpoint tester, dark code snippet blocks, and automatic SDK gen.",
    type: "Shared Projects",
    author: { name: "alex_dev", avatar: "A" },
    updatedAt: "3 days ago",
    tags: ["OpenAPI", "Next.js", "Lucide"],
    gradient: "from-zinc-900 to-zinc-950",
  },
];

export default function ProjectShowcase() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Projects");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects.filter((p) => {
    const matchesTab = activeTab === "All Projects" || p.type === activeTab;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <section id="projects" className="relative py-10 px-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-zinc-900">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            Explore Your Projects
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Manage and inspect all full-stack applications forged by you and your team on Anvilly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search projects or stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 pl-9 pr-4 py-2.5 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 w-fit mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="clean-card rounded-2xl overflow-hidden group flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Card Preview Mockup */}
                <div className={`h-44 bg-gradient-to-br ${project.gradient} p-4 relative flex flex-col justify-between border-b border-zinc-800/60`}>
                  {/* Top Mockup Bar */}
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-700" />
                      <span className="w-2 h-2 rounded-full bg-zinc-700" />
                      <span className="w-2 h-2 rounded-full bg-zinc-700" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                      {project.updatedAt}
                    </span>
                  </div>

                  {/* Abstract UI Representation */}
                  <div className="my-auto bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/80 backdrop-blur-sm shadow-xl group-hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded bg-zinc-700" />
                      <div className="w-20 h-2 bg-zinc-800 rounded" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full h-1.5 bg-zinc-800/60 rounded" />
                      <div className="w-3/4 h-1.5 bg-zinc-800/60 rounded" />
                    </div>
                  </div>

                  {/* Hover Open Project Overlay Button */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg shadow-lg hover:bg-zinc-200 transition-colors flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                      Open in Builder
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-white group-hover:text-zinc-200 transition-colors tracking-tight mb-1.5">
                    {project.title}
                  </h3>
                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-4">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 bg-zinc-900 text-zinc-400 text-[10px] font-mono rounded border border-zinc-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 py-3.5 bg-zinc-950/60 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
                    {project.author.avatar}
                  </div>
                  <span className="text-zinc-400 font-medium text-[11px]">
                    {project.author.name}
                  </span>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {project.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
          <p className="text-zinc-400 text-sm">No projects found in this category.</p>
        </div>
      )}
    </section>
  );
}
