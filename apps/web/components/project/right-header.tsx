"use client";

import { SidebarTrigger } from "../ui/sidebar";
import { Project } from "@/lib/types";
import ViewModeSwitcher from "./header/ViewModeSwitcher";
import DeviceToolbar from "./header/DeviceToolbar";
import UserAvatarMenu from "@/components/shared/UserAvatarMenu";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface RightHeaderProps {
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
  activeTab: "preview" | "code";
  setActiveTab: (t: "preview" | "code") => void;
  reloadProjectLink: () => void;
  project: Project;
}

export default function RightHeader({
  device,
  setDevice,
  activeTab,
  setActiveTab,
  reloadProjectLink,
  project,
}: RightHeaderProps) {
  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Project link copied to clipboard!");
      }
    } catch {
      toast.error("Failed to copy link");
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
        />
      </div>

      {/* Right: Share Button + User Avatar & Menu */}
      <div className="flex items-center gap-2.5 ml-auto">
        <button
          type="button"
          onClick={handleShare}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-200 hover:text-white text-xs font-medium transition-colors cursor-pointer select-none"
          title="Share Project"
        >
          <Share2 className="w-3 h-3" />
          <span>Share</span>
        </button>
        <UserAvatarMenu size="md" align="right" />
      </div>
    </header>
  );
}
