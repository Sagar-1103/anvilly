"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone,
  Copy,
  Check,
  Wifi,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface ExpoPreviewCardProps {
  expoUrl?: string;
  tunnelUrl?: string;
  projectTitle?: string;
}

export default function ExpoPreviewCard({
  expoUrl,
  tunnelUrl,
  projectTitle,
}: ExpoPreviewCardProps) {
  const [copied, setCopied] = useState(false);
  const targetUrl = expoUrl || tunnelUrl || "";

  const handleCopyLink = async () => {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      toast.success("Expo Go link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-zinc-950 text-white p-4 pt-3 pb-2 overflow-y-auto select-none relative">
      {/* Subtle ambient glow in background */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.08)_0%,transparent_65%)]" />

      {/* Top Phone Status Bar: Time, Dynamic Island, Cellular / Wifi / Battery */}
      <div className="w-full flex items-center justify-between px-2 pt-1 pb-2 z-10 shrink-0">
        <span className="text-[12px] font-semibold tracking-tight text-zinc-300 w-12">
          9:41
        </span>

        {/* Dynamic Island pill */}
        <div className="w-20 h-4.5 bg-black rounded-full border border-zinc-800/90 flex items-center justify-end px-2 shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 border border-zinc-800" />
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-1.5 text-zinc-300 w-12 justify-end">
          {/* Signal bars */}
          <div className="flex items-end gap-[1.5px] h-2.5">
            <span className="w-[2px] h-[3px] bg-zinc-300 rounded-[0.5px]" />
            <span className="w-[2px] h-[5px] bg-zinc-300 rounded-[0.5px]" />
            <span className="w-[2px] h-[7.5px] bg-zinc-300 rounded-[0.5px]" />
            <span className="w-[2px] h-[10px] bg-zinc-300 rounded-[0.5px]" />
          </div>
          {/* Wifi */}
          <Wifi className="w-3 h-3 text-zinc-300" />
          {/* Battery */}
          <div className="flex items-center gap-[1px]">
            <div className="w-4.5 h-2.2 border border-zinc-400 rounded-[3px] p-[1px] flex items-center">
              <div className="h-full w-2.5 bg-zinc-200 rounded-[1px]" />
            </div>
            <div className="w-[1.5px] h-1 bg-zinc-400 rounded-r-[0.5px]" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2 z-10 w-full max-w-[280px] mx-auto text-center">
        {/* Expo Go Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-medium text-zinc-300 mb-3 shadow-xs">
          <Smartphone className="w-3 h-3 text-indigo-400" />
          <span>Expo Go Preview</span>
        </div>

        <h3 className="text-base font-semibold text-white tracking-tight mb-1 truncate max-w-full">
          {projectTitle || "React Native App"}
        </h3>
        <p className="text-[12px] text-zinc-400 max-w-[240px] leading-relaxed mb-5">
          Scan with your iPhone Camera or the Expo Go app on Android.
        </p>

        {/* QR Code Container */}
        <div className="relative group p-4 bg-white rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.6)] border border-white/20 mb-5 transition-transform duration-300 hover:scale-[1.02]">
          {targetUrl ? (
            <QRCodeSVG
              value={targetUrl}
              size={180}
              bgColor="#ffffff"
              fgColor="#09090b"
              level="M"
            />
          ) : (
            <div className="w-[180px] h-[180px] flex flex-col items-center justify-center text-zinc-600 text-xs gap-2">
              <span className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-800 rounded-full animate-spin" />
              <span className="font-medium">Connecting...</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col items-center gap-2">
          <button
            onClick={handleCopyLink}
            disabled={!targetUrl}
            className="w-full max-w-[230px] flex items-center justify-center gap-2 py-2 px-4 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] transition-all rounded-xl text-xs font-medium text-white border border-zinc-700/60 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy Expo Link</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Bottom Area: subtle note & iOS Home Indicator Bar */}
      <div className="w-full flex flex-col items-center gap-2.5 z-10 shrink-0 pt-2 pb-1">
        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <Sparkles className="w-3 h-3 text-indigo-400/80" />
          <span>Live updates sync automatically</span>
        </div>
        {/* iOS Home Indicator */}
        <div className="w-32 h-1 bg-zinc-600/70 rounded-full" />
      </div>
    </div>
  );
}
