"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Smartphone,
  ExternalLink,
  Download,
  Loader2,
  X,
  ShieldCheck,
  Unlink,
  Package,
  Layers,
  Link2,
  Info,
  Ban,
  RotateCw,
  AlertTriangle,
  Rocket,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useExpoDeployment } from "@/hooks/use-expo-deployment";

interface ExpoDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle?: string;
}

export default function ExpoDeployModal({
  isOpen,
  onClose,
  projectId,
  projectTitle,
}: ExpoDeployModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"APK" | "AAB">("APK");
  const [tokenInput, setTokenInput] = useState("");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showPreviousBuilds, setShowPreviousBuilds] = useState(false);

  const {
    expoToken,
    loadingToken,
    savingToken,
    saveExpoToken,
    removeExpoToken,
    builds,
    totalCount,
    hasMore,
    isBuilding,
    loadingBuilds,
    triggeringBuild,
    triggerBuild,
    cancelingBuildId,
    cancelBuild,
    lastRefreshedAt,
    refetchBuilds,
  } = useExpoDeployment(projectId, { enabled: isOpen, pollIntervalMs: 120_000 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !triggeringBuild && !savingToken && !disconnecting) {
        if (showDisconnectConfirm) {
          setShowDisconnectConfirm(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, triggeringBuild, savingToken, disconnecting, showDisconnectConfirm, onClose]);

  if (!isOpen || !mounted) return null;

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const ok = await saveExpoToken(tokenInput.trim());
    if (ok) {
      setTokenInput("");
    }
  };

  const handleConfirmDisconnect = async () => {
    setDisconnecting(true);
    try {
      await removeExpoToken();
      setShowDisconnectConfirm(false);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleStartBuild = async () => {
    if (!expoToken) return;
    await triggerBuild(selectedFormat);
  };

  const latest = builds[0];
  const olderBuilds = builds.slice(1);

  const formatBuildDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (isToday) return `Today, ${time}`;
      return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FINISHED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "IN_PROGRESS":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "QUEUED":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "ERRORED":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      case "CANCELED":
        return "bg-zinc-800 text-zinc-400 border border-zinc-700/60";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700/60";
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!triggeringBuild && !savingToken) onClose();
        }}
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Disconnect Confirmation Modal Overlay */}
        {showDisconnectConfirm && expoToken && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => {
              if (!disconnecting) setShowDisconnectConfirm(false);
            }}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-[#121215] border border-zinc-800 p-5 shadow-2xl text-left space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Disconnect Expo Account</h3>
                  <p className="text-xs text-zinc-400">This action will remove your saved token</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Account:</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    @{expoToken.username || "expo_user"}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-zinc-400 font-sans text-xs">Token:</span>
                  <span className="text-zinc-300">{expoToken.tokenPreview}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to disconnect this Expo account? You will need to enter your access token again to trigger cloud APK or AAB builds.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDisconnectConfirm(false)}
                  disabled={disconnecting}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisconnect}
                  disabled={disconnecting}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Disconnecting...</span>
                    </>
                  ) : (
                    <>
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Deploy to Expo Dashboard
              </h2>
              <p className="text-[11px] text-zinc-400 truncate max-w-[320px]">
                {projectTitle || "React Native Mobile App"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={triggeringBuild || savingToken}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Non-scrollable, rock-solid modal container) */}
        <div className="p-5 space-y-3.5 flex-1">
          {/* Section 1: Expo Account Authentication */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Expo Account
              </span>
              <a
                href="https://expo.dev/settings/access-tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:underline"
              >
                Get Token on Expo <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {loadingToken ? (
              <div className="py-2 flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                Checking Expo credentials...
              </div>
            ) : expoToken ? (
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-xs font-medium text-white">
                    Connected as{" "}
                    <span className="text-emerald-400 font-mono">
                      @{expoToken.username || "expo_user"}
                    </span>
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    ({expoToken.tokenPreview})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Disconnect account"
                >
                  <Unlink className="w-3 h-3" />
                  Disconnect
                </button>
              </div>
            ) : (
              <form onSubmit={handleConnectToken} className="space-y-2">
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Enter your Personal Access Token from your Expo dashboard to build and publish directly to your account.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="Paste Expo Access Token..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={savingToken || !tokenInput.trim()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {savingToken ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" />
                    )}
                    Connect
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Section 2: Choose Build Format */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-200">
              Select Build Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: APK */}
              <div
                onClick={() => setSelectedFormat("APK")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  selectedFormat === "APK"
                    ? "bg-indigo-950/20 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                    APK
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-white">
                    Direct Android APK
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Standalone file installable directly on any Android phone for testing and sharing.
                  </p>
                </div>
              </div>

              {/* Option 2: AAB */}
              <div
                onClick={() => setSelectedFormat("AAB")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  selectedFormat === "AAB"
                    ? "bg-indigo-950/20 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                    : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                    AAB
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-medium text-white">
                    Google Play Bundle
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                    Standard production app bundle optimized for submitting to the Google Play Console.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Recent Builds History (Idea 1: Pinned Latest + Compact Collapsible List) */}
          {builds.length > 0 && latest && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">
                    Build Status & History
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 font-mono">
                    {totalCount > builds.length ? `${builds.length} of ${totalCount}` : builds.length}
                  </span>
                  {lastRefreshedAt && (
                    <span className="text-[10px] text-zinc-500 font-mono">
                      (Last checked: {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => refetchBuilds()}
                  disabled={loadingBuilds}
                  className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-zinc-800/60 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Check latest status from Expo"
                >
                  <RotateCw className={`w-3 h-3 ${loadingBuilds ? "animate-spin text-indigo-400" : ""}`} />
                  <span>{loadingBuilds ? "Refreshing..." : "Refresh"}</span>
                </button>
              </div>

              {/* Pinned Hero Card: Latest / Active Build (Compact & Sleek) */}
              <div
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  latest.status === "IN_PROGRESS"
                    ? "bg-gradient-to-r from-indigo-950/40 via-zinc-900/90 to-zinc-900/60 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.12)]"
                    : latest.status === "QUEUED"
                    ? "bg-gradient-to-r from-amber-950/30 via-zinc-900/90 to-zinc-900/60 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                    : latest.status === "FINISHED"
                    ? "bg-gradient-to-r from-emerald-950/30 via-zinc-900/90 to-zinc-900/60 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
                    : latest.status === "ERRORED"
                    ? "bg-gradient-to-r from-rose-950/30 via-zinc-900/90 to-zinc-900/60 border-rose-500/40"
                    : "bg-zinc-900/60 border-zinc-800/80"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      latest.status === "FINISHED"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : latest.status === "IN_PROGRESS" || latest.status === "QUEUED"
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                        : latest.status === "ERRORED"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-zinc-800/80 border-zinc-700/60 text-zinc-400"
                    }`}
                  >
                    {latest.buildType === "APK" ? (
                      <Package className="w-4 h-4" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs">
                        {latest.buildType}
                      </span>

                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-medium flex items-center gap-1 ${getStatusBadge(
                          latest.status
                        )}`}
                      >
                        {latest.status === "IN_PROGRESS" && (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        )}
                        {latest.status === "QUEUED" && (
                          <Clock className="w-2.5 h-2.5" />
                        )}
                        {latest.status === "FINISHED" && (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        )}
                        {latest.status === "ERRORED" && (
                          <AlertCircle className="w-2.5 h-2.5" />
                        )}
                        {latest.status.replace("_", " ")}
                      </span>

                      <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-0.2 rounded bg-zinc-800/90 text-zinc-400 border border-zinc-700/50">
                        Latest
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <span>{formatBuildDate(latest.createdAt)}</span>
                      {latest.status === "IN_PROGRESS" && (
                        <span className="text-indigo-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping inline-block" />
                          Building on Cloud
                        </span>
                      )}
                      {latest.errorDetails && latest.status === "ERRORED" && (
                        <span className="text-rose-400 truncate max-w-[200px]" title={latest.errorDetails}>
                          {latest.errorDetails}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {(latest.status === "QUEUED" || latest.status === "IN_PROGRESS") && (
                    <button
                      type="button"
                      onClick={() => cancelBuild(latest.id)}
                      disabled={cancelingBuildId === latest.id}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-[11px] font-medium border border-rose-500/20 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Cancel this build"
                    >
                      {cancelingBuildId === latest.id ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          <span>Canceling...</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-2.5 h-2.5" />
                          <span>Cancel</span>
                        </>
                      )}
                    </button>
                  )}

                  {(latest.expoBuildUrl || latest.expoBuildId) && (
                    <a
                      href={latest.expoBuildUrl || `https://expo.dev/builds/${latest.expoBuildId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>Expo</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}

                  {latest.artifactUrl && latest.status === "FINISHED" && (
                    <a
                      href={latest.artifactUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Download</span>
                      <Download className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Section: Older Builds (Option 2: Collapsible Accordion - Zero Space When Closed) */}
              {olderBuilds.length > 0 && (
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPreviousBuilds(!showPreviousBuilds)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700/80 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform duration-200 ease-out ${
                          showPreviousBuilds ? "rotate-180 text-indigo-400" : ""
                        }`}
                      />
                      <span className="font-medium text-xs">Previous Builds</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                        {olderBuilds.length}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {showPreviousBuilds ? "Hide" : "View"}
                    </span>
                  </button>

                  {/* Smooth Animated Accordion Body (0fr -> 1fr grid transition) */}
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                      showPreviousBuilds
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-1.5 pt-2 max-h-40 overflow-y-auto pr-1">
                        {olderBuilds.map((b) => (
                          <div
                            key={b.id}
                            className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-semibold text-white text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">
                                {b.buildType}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${getStatusBadge(
                                  b.status
                                )}`}
                              >
                                {b.status.replace("_", " ")}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                {formatBuildDate(b.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {(b.status === "QUEUED" || b.status === "IN_PROGRESS") && (
                                <button
                                  type="button"
                                  onClick={() => cancelBuild(b.id)}
                                  disabled={cancelingBuildId === b.id}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {cancelingBuildId === b.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Ban className="w-3 h-3" />
                                  )}
                                  Cancel
                                </button>
                              )}

                              {(b.expoBuildUrl || b.expoBuildId) && (
                                <a
                                  href={b.expoBuildUrl || `https://expo.dev/builds/${b.expoBuildId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                                >
                                  Expo <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}

                              {b.artifactUrl && (
                                <a
                                  href={b.artifactUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                                >
                                  <Download className="w-2.5 h-2.5" />
                                  Download
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Complete history link on Expo */}
                      <div className="flex items-center justify-between text-[11px] pt-2 px-1 pb-0.5">
                        <a
                          href={expoToken?.username ? `https://expo.dev/accounts/${expoToken.username}` : "https://expo.dev"}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
                        >
                          <span>View full history on Expo Dashboard</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start gap-2 text-[11px] text-zinc-400 leading-relaxed">
            <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
            <span>
              Builds execute asynchronously in Expo Cloud builders. Once triggered, you can inspect real-time compiler logs and install artifacts directly from your Expo Dashboard.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={handleStartBuild}
            disabled={!expoToken || isBuilding || triggeringBuild}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
          >
            {triggeringBuild ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading Snapshot to Expo...</span>
              </>
            ) : isBuilding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Build In Progress...</span>
              </>
            ) : (
              <>
                <Rocket className="w-3.5 h-3.5" />
                <span>Start EAS {selectedFormat} Build</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
