"use client";

import { SidebarTrigger } from "../ui/sidebar";
import { Project } from "@/lib/types";
import ViewModeSwitcher from "./header/ViewModeSwitcher";
import DeviceToolbar from "./header/DeviceToolbar";
import UserAvatarMenu from "@/components/shared/UserAvatarMenu";

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
  return (
    <header className="h-12 shrink-0 bg-black border-b border-white/6 px-4 flex items-center justify-between z-30 relative">
      {/* Left: sidebar toggle + preview/code switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        <SidebarTrigger className="text-zinc-400 cursor-pointer hover:text-white -ml-1" />
        <ViewModeSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Center: Device cycle & navigation toolbar (absolutely centered) */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <DeviceToolbar
          device={device}
          setDevice={setDevice}
          reloadProjectLink={reloadProjectLink}
          projectUrl={project.url}
        />
      </div>

      {/* Right: User Avatar & Menu */}
      <div className="flex items-center gap-2 ml-auto">
        <UserAvatarMenu size="sm" align="right" />
      </div>
    </header>
  );
}
