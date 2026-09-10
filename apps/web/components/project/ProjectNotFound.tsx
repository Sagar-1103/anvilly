"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Copy, Check } from "lucide-react";
import UserAvatarMenu from "@/components/shared/UserAvatarMenu";
import { useSession } from "next-auth/react";

interface ProjectNotFoundProps {
  projectId: string;
  error?: {
    message?: string;
    statusCode?: number;
  } | null;
  onRetry?: () => void;
}

export default function ProjectNotFound({
  projectId,
  error,
  onRetry,
}: ProjectNotFoundProps) {
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);

  const statusCode = error?.statusCode || 404;
  const isForbidden = statusCode === 403;
  const isUnauthorized = statusCode === 401;

  const title = isForbidden
    ? "Access Restricted"
    : isUnauthorized
    ? "Sign In Required"
    : "Project Not Found";

  const description = isForbidden
    ? "You don't have permission to view this project. It belongs to another account."
    : isUnauthorized
    ? "You must be signed in to access this project workspace."
    : "This project doesn't exist, has been deleted, or the URL is incorrect.";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(projectId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 hero-grid pointer-events-none opacity-40" />
      <div className="absolute inset-0 hero-radial pointer-events-none" />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] blur-[140px] pointer-events-none rounded-full transition-colors duration-500 ${
          isForbidden ? "bg-amber-500/8" : "bg-red-500/8"
        }`}
      />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center">
          <span className="text-xl font-extrabold tracking-tighter text-white font-mono transition-opacity duration-200 group-hover:opacity-80">
            anvilly
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <UserAvatarMenu size="sm" align="right" />
          ) : (
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center -mt-6">
        <div className="max-w-md w-full flex flex-col items-center space-y-6 animate-fade-in-up">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono tracking-wide text-zinc-400 shadow-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isForbidden
                  ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                  : isUnauthorized
                  ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.7)]"
                  : "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]"
              }`}
            />
            <span>
              {statusCode} • {isForbidden ? "Forbidden" : isUnauthorized ? "Unauthorized" : "Not Found"}
            </span>
          </div>

          {/* Heading & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              {title}
            </h1>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Minimal Project Identifier Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 text-zinc-500 text-xs font-mono">
            <span className="text-zinc-600">id:</span>
            <span className="text-zinc-300 select-all truncate max-w-[220px]">
              {projectId}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="ml-1 text-zinc-500 hover:text-zinc-200 transition-colors p-1 rounded-md hover:bg-zinc-800 cursor-pointer"
              title="Copy Project ID"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-lg shadow-white/5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </Link>

            {onRetry && !isUnauthorized && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs active:scale-[0.98] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 py-6 text-center text-[11px] text-zinc-600 font-mono">
        anvilly • workspace
      </footer>
    </div>
  );
}
