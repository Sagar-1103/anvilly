"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Smartphone, Layout } from "lucide-react";
import { BackendProject } from "./types";
import ProjectCardMenu from "./ProjectCardMenu";

interface ProjectCardProps {
  project: BackendProject;
  gradient: string;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onSelectDelete: () => void;
}

function formatRelativeTime(dateStr: string) {
  if (!dateStr) return "Recently";
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default function ProjectCard({
  project,
  gradient,
  isMenuOpen,
  onToggleMenu,
  onSelectDelete,
}: ProjectCardProps) {
  const router = useRouter();
  const title = project.title || "Untitled Project";
  const relativeTime = formatRelativeTime(project.updatedAt || project.createdAt);
  const isMobile = project.template === "node-react-native-expo";

  return (
    <div
      onClick={() => router.push(`/projects/${project.id}`)}
      className="clean-card rounded-2xl overflow-hidden group flex flex-col cursor-pointer border border-zinc-900 hover:border-zinc-800 transition-all relative"
    >
      {/* Card Preview Mockup */}
      <div
        className={`h-44 ${project.previewImage ? "bg-zinc-950" : `bg-linear-to-br ${gradient}`} relative flex flex-col justify-between border-b border-zinc-800/60 overflow-hidden`}
      >
        {project.previewImage ? (
          <div className="relative w-full h-full overflow-hidden">
            {/* Badges Overlay */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
              <span
                className={`text-[10px] font-mono ${
                  isMobile
                    ? "text-indigo-300 bg-indigo-950/80 border-indigo-800/60"
                    : "text-sky-300 bg-zinc-950/80 border-zinc-800"
                } backdrop-blur-md px-1.5 py-0.5 rounded border flex items-center gap-1`}
              >
                {isMobile ? (
                  <>
                    <Smartphone className="w-2.5 h-2.5 text-indigo-400" /> Expo
                  </>
                ) : (
                  <>
                    <Layout className="w-2.5 h-2.5 text-sky-400" /> React
                  </>
                )}
              </span>
              <span className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-zinc-800">
                {relativeTime}
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.previewImage}
              alt={title}
              className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            />
          </div>
        ) : isMobile ? (
          /* Expo Mobile Mockup */
          <div className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60 flex items-center gap-1">
                  <Smartphone className="w-2.5 h-2.5" /> Expo
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                  {relativeTime}
                </span>
              </div>
            </div>
            <div className="my-auto flex flex-col items-center justify-center gap-2 text-center py-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono text-zinc-400">React Native / Expo Go</span>
            </div>
          </div>
        ) : (
          /* Abstract Fallback Placeholder */
          <div className="p-4 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-sky-300 bg-zinc-950/80 px-1.5 py-0.5 rounded border border-zinc-800 flex items-center gap-1">
                  <Layout className="w-2.5 h-2.5 text-sky-400" /> React
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                  {relativeTime}
                </span>
              </div>
            </div>
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
          </div>
        )}

        {/* Hover Open Overlay Button */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20">
          <Link href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
            <span className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg shadow-lg hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer">
              Open
            </span>
          </Link>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1.5 relative">
          <h3 className="text-base font-semibold text-white group-hover:text-zinc-200 transition-colors tracking-tight line-clamp-1 flex-1">
            {title}
          </h3>

          {/* Three Dots Options Menu */}
          <ProjectCardMenu
            project={project}
            isOpen={isMenuOpen}
            onToggle={onToggleMenu}
            onSelectDelete={onSelectDelete}
          />
        </div>

        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
          {project.prompt}
        </p>
      </div>
    </div>
  );
}
