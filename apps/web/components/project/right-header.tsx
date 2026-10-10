"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BACKEND_URL } from "@/lib/config";
import { SidebarTrigger } from "../ui/sidebar";
import { Project } from "@/lib/types";
import ViewModeSwitcher from "./header/ViewModeSwitcher";
import DeviceToolbar from "./header/DeviceToolbar";
import UserAvatarMenu from "@/components/shared/UserAvatarMenu";
import ExpoDeployModal from "./ExpoDeployModal";
import { Share2, Pencil, Smartphone, Loader2, ChevronDown, Download, Copy, Rocket } from "lucide-react";
import { toast } from "sonner";

const SHARE_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes cache

interface RightHeaderProps {
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
  activeTab: "preview" | "code";
  setActiveTab: (t: "preview" | "code") => void;
  reloadProjectLink: () => void;
  project: Project;
  onEdit?: () => void;
  isPreviewReady?: boolean;
}

export default function RightHeader({
  device,
  setDevice,
  activeTab,
  setActiveTab,
  reloadProjectLink,
  project,
  onEdit,
  isPreviewReady = true,
}: RightHeaderProps) {
  const { data: session } = useSession();
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [fetchingApk, setFetchingApk] = useState(false);
  const [sharingWeb, setSharingWeb] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const cachedApkRef = useRef<{
    projectId: string;
    url: string;
    timestamp: number;
  } | null>(null);

  const isExpo = project.template === "node_react_native_expo";

  // Close share dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Web project share (direct copy)
  const handleWebShare = async () => {
    if (sharingWeb) return;
    setSharingWeb(true);
    try {
      if (typeof window === "undefined") return;

      if (project.url) {
        const safeUrl =
          project.url.startsWith("http://") &&
          (window.location.protocol === "https:" || project.url.includes(".e2b.app"))
            ? project.url.replace(/^http:\/\//i, "https://")
            : project.url;
        await navigator.clipboard.writeText(safeUrl);
        toast.success("Live preview link copied to clipboard!");
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      toast.success("Project link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    } finally {
      setSharingWeb(false);
    }
  };

  // Mobile Option 1: Expo Go Link
  const handleCopyExpoLink = async () => {
    try {
      const expoLink = project.expoUrl || project.tunnelUrl;
      if (expoLink) {
        await navigator.clipboard.writeText(expoLink);
        toast.success("Expo Go link copied to clipboard!");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Project link copied to clipboard!");
      }
      setIsShareMenuOpen(false);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Mobile Option 2: Download APK Link with 2-minute TTL cache
  const handleCopyDownloadLink = async () => {
    if (fetchingApk) return;

    // Fast-path: Check cached APK if within 2-minute TTL
    const now = Date.now();
    if (
      cachedApkRef.current &&
      cachedApkRef.current.projectId === project.id &&
      now - cachedApkRef.current.timestamp < SHARE_CACHE_TTL_MS
    ) {
      try {
        await navigator.clipboard.writeText(cachedApkRef.current.url);
        toast.success("APK download link copied to clipboard!");
        setIsShareMenuOpen(false);
      } catch {
        toast.error("Failed to copy link");
      }
      return;
    }

    setFetchingApk(true);
    try {
      if (project.id && session?.jwtToken) {
        const res = await fetch(`${BACKEND_URL}/api/projects/${project.id}/builds`, {
          headers: { Authorization: `Bearer ${session.jwtToken}` },
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.builds)) {
          const finishedBuild = data.builds.find(
            (b: any) => b.status === "FINISHED" && b.artifactUrl
          );
          if (finishedBuild?.artifactUrl) {
            cachedApkRef.current = {
              projectId: project.id,
              url: finishedBuild.artifactUrl,
              timestamp: Date.now(),
            };
            await navigator.clipboard.writeText(finishedBuild.artifactUrl);
            toast.success("APK download link copied to clipboard!");
            setIsShareMenuOpen(false);
            return;
          }

          const hasActiveBuild = data.builds.some(
            (b: any) => b.status === "IN_PROGRESS" || b.status === "PENDING"
          );
          if (hasActiveBuild) {
            toast.info("Build is currently in progress. APK will be ready shortly!");
            setIsShareMenuOpen(false);
            return;
          }
        }
      }

      toast.error("No finished APK found. Click 'Deploy' to start a build.");
      setIsShareMenuOpen(false);
    } catch (err) {
      console.warn("[handleCopyDownloadLink] Error fetching builds:", err);
      toast.error("Failed to check for APK build");
    } finally {
      setFetchingApk(false);
    }
  };

  const handleShareClick = () => {
    if (isExpo) {
      setIsShareMenuOpen((prev) => !prev);
    } else {
      handleWebShare();
    }
  };

  return (
    <header className="h-12 shrink-0 bg-[#18181b] border-b border-[#27272b] px-4 flex items-center justify-between z-30 relative">
      {/* Left: sidebar toggle + preview/code switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        <SidebarTrigger className="text-zinc-400 cursor-pointer hover:text-white -ml-1 hover:bg-white/[0.06] transition-colors" />
        <ViewModeSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Center: Device cycle & navigation toolbar (absolutely centered) */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <DeviceToolbar
          device={device}
          setDevice={setDevice}
          reloadProjectLink={reloadProjectLink}
          projectUrl={project.url}
          template={project.template}
          isPreviewReady={isPreviewReady}
        />
      </div>

      {/* Right: Actions Group + User Avatar & Menu */}
      <div className="flex items-center gap-2.5 ml-auto">
        <div className="relative" ref={shareMenuRef}>
          <div className="flex items-center rounded-full bg-[#242429] border border-white/10 shadow-xs overflow-hidden">
            {isExpo && project.id && (
              <button
                type="button"
                onClick={() => setIsDeployOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-indigo-300 hover:text-white hover:bg-indigo-500/20 text-xs font-medium transition-colors cursor-pointer select-none"
                title="Deploy to Expo Dashboard (APK / AAB)"
              >
                <Rocket className="w-3.5 h-3.5 text-indigo-400" />
                <span>Deploy</span>
              </button>
            )}

            {isExpo && project.id && onEdit && (
              <div className="w-px h-3.5 bg-white/10 shrink-0" />
            )}

            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-violet-300 hover:text-white hover:bg-violet-500/20 text-xs font-medium transition-colors cursor-pointer select-none"
                title="Edit Project Details"
              >
                <Pencil className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            <div className="w-px h-3.5 bg-white/10 shrink-0 hidden sm:block" />

            <button
              type="button"
              onClick={handleShareClick}
              disabled={sharingWeb}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer select-none disabled:opacity-50 ${
                isShareMenuOpen ? "bg-white/[0.12] text-white" : "hover:bg-white/[0.08]"
              }`}
              title={isExpo ? "Share Project Options" : "Share Project"}
            >
              {sharingWeb ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span className="hidden sm:inline">Share</span>
              {isExpo && (
                <ChevronDown
                  className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
                    isShareMenuOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>
          </div>

          {/* Mobile Share Dropdown Menu */}
          {isExpo && isShareMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#1c1c20] border border-white/10 shadow-2xl shadow-black/80 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[11px] font-medium text-zinc-400 border-b border-white/5 mb-1 flex items-center justify-between">
                <span>Share Mobile App</span>
                <span className="text-[10px] text-zinc-500">2 options</span>
              </div>

              {/* Option 1: Expo Go Link */}
              <button
                type="button"
                onClick={handleCopyExpoLink}
                className="w-full text-left p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:border-purple-500/40 transition-colors shrink-0">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Expo Go Link</div>
                    <div className="text-[10px] text-zinc-400">Test live in Expo Go app</div>
                  </div>
                </div>
                <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </button>

              {/* Option 2: Download APK Link */}
              <button
                type="button"
                onClick={handleCopyDownloadLink}
                disabled={fetchingApk}
                className="w-full text-left p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-between group mt-0.5 disabled:opacity-50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors shrink-0">
                    {fetchingApk ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white">Download APK Link</div>
                    <div className="text-[10px] text-zinc-400">Installable Android package</div>
                  </div>
                </div>
                <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </button>
            </div>
          )}
        </div>

        <UserAvatarMenu size="md" align="right" />
      </div>

      {isExpo && project.id && (
        <ExpoDeployModal
          isOpen={isDeployOpen}
          onClose={() => setIsDeployOpen(false)}
          projectId={project.id}
          projectTitle={project.title || undefined}
        />
      )}
    </header>
  );
}
