"use client";

import { RotateCw, ExternalLink, Monitor, Tablet, Smartphone } from "lucide-react";

interface DeviceToolbarProps {
  device: "desktop" | "tablet" | "mobile";
  setDevice: (device: "desktop" | "tablet" | "mobile") => void;
  reloadProjectLink: () => void;
  projectUrl?: string;
  template?: string;
}

export default function DeviceToolbar({
  device,
  setDevice,
  reloadProjectLink,
  projectUrl,
  template,
}: DeviceToolbarProps) {
  const cycleDevice = () => {
    if (device === "desktop") setDevice("tablet");
    else if (device === "tablet") setDevice("mobile");
    else setDevice("desktop");
  };

  const openProjectUrl = () => {
    if (!projectUrl) return;
    window.open(projectUrl, "_blank");
  };

  const isExpo = template === "node_react_native_expo";

  return (
    <div className="flex items-center gap-2">
      {isExpo && (
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#391e66] border border-[#6366f1]/40 text-purple-200 flex items-center gap-1 shadow-xs">
          <Smartphone className="w-2.5 h-2.5" /> Expo Go
        </span>
      )}
      <div className="flex items-center gap-1">
        {/* Device cycle toggle button */}
        <button
          type="button"
          onClick={cycleDevice}
          className={`p-1.5 cursor-pointer rounded-lg transition-colors ${
            device === "desktop"
              ? "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
              : "text-white bg-[#34343a] border border-white/10 shadow-xs"
          }`}
          title={`Device mode: ${device} (click to switch)`}
        >
          {device === "desktop" && <Monitor className="w-3.5 h-3.5" strokeWidth={1.8} />}
          {device === "tablet" && <Tablet className="w-3.5 h-3.5" strokeWidth={1.8} />}
          {device === "mobile" && <Smartphone className="w-3.5 h-3.5" strokeWidth={1.8} />}
        </button>

        {/* Refresh */}
        <button
          type="button"
          onClick={reloadProjectLink}
          className="p-1.5 cursor-pointer rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Refresh preview"
        >
          <RotateCw className="w-3.5 h-3.5" strokeWidth={2} />
        </button>

        {/* External link */}
        <button
          type="button"
          onClick={openProjectUrl}
          className="p-1.5 cursor-pointer rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Open in new tab"
          disabled={!projectUrl}
        >
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
