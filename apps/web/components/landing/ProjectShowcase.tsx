"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/lib/config";
import { toast } from "sonner";
import { BackendProject, ShowcaseTabType } from "./showcase/types";
import ShowcaseHeader from "./showcase/ShowcaseHeader";
import ShowcaseTabs from "./showcase/ShowcaseTabs";
import ProjectCard from "./showcase/ProjectCard";
import ProjectDeleteModal from "./showcase/ProjectDeleteModal";
import ShowcaseSkeleton from "./showcase/ShowcaseSkeleton";
import ShowcaseEmptyState from "./showcase/ShowcaseEmptyState";

const gradients = [
  "from-zinc-800 to-zinc-900",
  "from-zinc-900 to-zinc-950",
  "from-zinc-800 to-zinc-950",
];

export default function ProjectShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseTabType>("All Projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState<BackendProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<BackendProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();

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
      {/* 1. Header & Search Filter */}
      <ShowcaseHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Navigation Filter Tabs */}
      <ShowcaseTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 3. Projects Grid / Skeleton / Empty State */}
      {loading ? (
        <ShowcaseSkeleton />
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              gradient={gradients[idx % gradients.length]}
              userName={userName}
              userInitial={userInitial}
              isMenuOpen={openMenuId === project.id}
              onToggleMenu={() =>
                setOpenMenuId(openMenuId === project.id ? null : project.id)
              }
              onSelectDelete={() => {
                setOpenMenuId(null);
                setProjectToDelete(project);
              }}
            />
          ))}
        </div>
      ) : (
        <ShowcaseEmptyState
          searchQuery={searchQuery}
          activeTab={activeTab}
          onClearSearch={() => setSearchQuery("")}
          onSelectTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* 4. Delete Confirmation Modal */}
      <ProjectDeleteModal
        project={projectToDelete}
        isDeleting={isDeleting}
        onCancel={() => setProjectToDelete(null)}
        onConfirmDelete={handleDeleteConfirm}
      />
    </section>
  );
}
