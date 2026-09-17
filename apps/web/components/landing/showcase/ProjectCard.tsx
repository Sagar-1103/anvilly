"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Smartphone, Layout } from "lucide-react";
import { BackendProject } from "./types";
import ProjectCardMenu from "./ProjectCardMenu";

interface ProjectCardProps {
  project: BackendProject;
  gradient: string;
  userName: string;
  userInitial: string;
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
  userName,
  userInitial,
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
      className="clean-card rounded-2xl overflow-hidden group flex flex-col justify-between cursor-pointer border border-zinc-900 hover:border-zinc-800 transition-all relative"
    >
      <div>
        {/* Card Preview Mockup */}
        <div
          className={`h-44 bg-linear-to-br ${gradient} p-4 relative flex flex-col justify-between border-b border-zinc-800/60`}
        >
          {/* Top Mockup Bar */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-700" />
              <span className="w-2 h-2 rounded-full bg-zinc-700" />
              <span className="w-2 h-2 rounded-full bg-zinc-700" />
            </div>
            <div className="flex items-center gap-1.5">
              {isMobile && (
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60 flex items-center gap-1">
                  <Smartphone className="w-2.5 h-2.5" /> Expo
                </span>
              )}
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                {relativeTime}
              </span>
            </div>
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

          {/* Hover Open Overlay Button */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <Link href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
              <span className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg shadow-lg hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer">
                Open
              </span>
            </Link>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
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

          <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-4">
            {project.prompt}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3.5 bg-zinc-950/60 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
            {userInitial}
          </div>
          <span className="text-zinc-400 font-medium text-[11px]">
            {userName}
          </span>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-1.5">
          {isMobile ? (
            <>
              <Smartphone className="w-3 h-3 text-indigo-400" />
              <span>Mobile (Expo)</span>
            </>
          ) : (
            <>
              <Layout className="w-3 h-3 text-zinc-400" />
              <span>Web (React)</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
