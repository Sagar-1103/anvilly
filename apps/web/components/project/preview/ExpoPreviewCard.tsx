"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  Sparkles,
  Info,
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
    <div className="w-full h-full flex flex-col items-center justify-between bg-zinc-950 text-white p-6 overflow-y-auto select-none">
      {/* Top Mobile Bar: Simulated Dynamic Island & Status */}
      <div className="w-full flex flex-col items-center gap-3">
        <div className="w-24 h-4 bg-zinc-900 rounded-full border border-zinc-800/80 mx-auto" />

        <div className="w-full flex items-center justify-between px-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-zinc-200">Expo Go</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/70 border border-emerald-800/50 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Fast Refresh
            </span>
            <Wifi className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>
      </div>

      {/* Main Content Area: QR Code Card */}
      <div className="flex-1 w-full max-w-xs flex flex-col items-center justify-center my-4">
        <div className="relative group w-full bg-linear-to-b from-zinc-900/90 to-zinc-950/90 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center backdrop-blur-xl">
          {/* Subtle glow behind QR */}
          <div className="absolute inset-0 -z-10 bg-indigo-600/10 rounded-3xl blur-xl group-hover:bg-indigo-600/15 transition-all duration-500" />

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-2xl shadow-lg border border-zinc-200/20 mb-4 flex items-center justify-center">
            {targetUrl ? (
              <QRCodeSVG
                value={targetUrl}
                size={180}
                bgColor="#ffffff"
                fgColor="#09090b"
                level="M"
              />
            ) : (
              <div className="w-[180px] h-[180px] flex flex-col items-center justify-center text-zinc-400 text-xs gap-2">
                <span className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                <span>Generating QR...</span>
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold text-white tracking-tight mb-1">
            {projectTitle || "React Native App"}
          </h3>
          <p className="text-[11px] text-zinc-400 max-w-[220px] leading-relaxed mb-4">
            Scan with your iPhone Camera or the Expo Go app on Android.
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={handleCopyLink}
              disabled={!targetUrl}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800/90 hover:bg-zinc-700/90 active:scale-[0.98] transition-all rounded-xl text-xs font-medium text-white border border-zinc-700/60 cursor-pointer disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Copy Expo Go Link</span>
                </>
              )}
            </button>

            {tunnelUrl && (
              <a
                href={tunnelUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <span>Open Metro Packager</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Instructions / Guide */}
      <div className="w-full max-w-xs bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-3 text-[11px] text-zinc-400 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Real-time Live Preview</span>
        </div>
        <div className="flex items-start gap-1.5 text-zinc-400 text-[10px] leading-normal">
          <Info className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
          <span>
            Changes made in the editor or chat apply immediately to your phone
            without needing to rescan.
          </span>
        </div>
      </div>
    </div>
  );
}
