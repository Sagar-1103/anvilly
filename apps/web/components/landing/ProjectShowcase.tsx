"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/config";
import { Trash2, AlertTriangle, Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";

interface BackendProject {
  id: string;
  title: string | null;
  prompt: string;
  sandboxId: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const tabs = ["All Projects", "My Projects", "Shared Projects"] as const;

const gradients = [
  "from-zinc-800 to-zinc-900",
  "from-zinc-900 to-zinc-950",
  "from-zinc-800 to-zinc-950",
];

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

export default function ProjectShowcase() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<BackendProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const getProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/projects`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.jwtToken}`,
        },
      });
      const res = await response.data;

      if (res.success && Array.isArray(res.projects)) {
        setProjects(res.projects);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.jwtToken) {
      getProjects();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    const id = projectToDelete.id;
    try {
      setIsDeleting(true);
      const response = await axios.delete(`${BACKEND_URL}/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${session?.jwtToken}`,
        },
      });
      if (response.data?.success) {
        toast.success("Project deleted successfully");
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(response.data?.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects
    .filter((p) => {
      if (activeTab === "Shared Projects") return false;

      const titleStr = p.title || "Untitled Project";
      const promptStr = p.prompt || "";
      const matchesSearch =
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promptStr.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.updatedAt).getTime() -
        new Date(a.createdAt || a.updatedAt).getTime()
    );

  const userInitial =
    session?.user?.name?.[0]?.toUpperCase() ||
    session?.user?.email?.[0]?.toUpperCase() ||
    "U";
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "You";

  return (
    <section id="projects" className="relative py-10 px-6 max-w-7xl mx-auto w-full">
      {/* Header & Controls */}
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
            placeholder="Search projects..."
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

      {/* Project Grid / Loading / Empty state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-zinc-950/60 border border-zinc-900 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="h-32 bg-zinc-900/60 rounded-xl" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-zinc-900 rounded w-2/3" />
                <div className="h-3 bg-zinc-900/60 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => {
            const gradient = gradients[idx % gradients.length];
            const title = project.title || "Untitled Project";
            const relativeTime = formatRelativeTime(project.updatedAt || project.createdAt);

            return (
              <div
                key={project.id}
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
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                        {relativeTime}
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

                    {/* Hover Open Overlay Button */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Link href={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
                        <button className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-lg shadow-lg hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer">
                          Open
                        </button>
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
                      <div className="relative shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === project.id ? null : project.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === project.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-7 z-30 w-40 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                                setProjectToDelete(project);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Project
                            </button>
                          </div>
                        )}
                      </div>
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

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Project
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/30">
          <p className="text-zinc-400 text-sm">No projects found.</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Project</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/60">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                "{projectToDelete.title || "Untitled Project"}"
              </span>
              ? All history, files, and sandboxes associated with this project will be permanently erased.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
