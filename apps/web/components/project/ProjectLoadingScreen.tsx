"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface ProjectLoadingScreenProps {
  projectId?: string;
}

const LOADING_STEPS = [
  "Preparing sandbox environment...",
  "Loading project workspace...",
  "Synchronizing project files...",
  "Initializing live preview...",
];

export default function ProjectLoadingScreen({
  projectId,
}: ProjectLoadingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050508] text-white flex flex-col justify-between overflow-hidden select-none antialiased">
      {/* Background Atmosphere - Landing page violet/indigo aurora theme */}
      <div className="absolute inset-0 hero-grid pointer-events-none opacity-30" />

      {/* Central Aurora Glows */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-violet-600/15 blur-[130px] pointer-events-none animate-pulse-subtle"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-indigo-500/10 blur-[90px] pointer-events-none"
      />

      {/* Ambient background particles/stars */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-[15%] w-1 h-1 rounded-full bg-violet-400/50 animate-pulse pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 right-[20%] w-1.5 h-1.5 rounded-full bg-purple-300/40 animate-pulse pointer-events-none"
        style={{ animationDelay: "1.2s" }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/3 left-[28%] w-1 h-1 rounded-full bg-indigo-300/50 animate-pulse pointer-events-none"
        style={{ animationDelay: "2.1s" }}
      />

      {/* Center Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md w-full flex flex-col items-center space-y-7 animate-fade-in-up">
          {/* Logo / Emblem Container with Violet Glow */}
          <div className="relative group">
            {/* Pulsing backdrop ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600/30 via-purple-500/20 to-indigo-600/30 rounded-3xl blur-md opacity-75 animate-pulse" />

            {/* Glass Icon Card */}
            <div className="relative w-16 h-16 rounded-2xl bg-[#090810] border border-white/10 flex items-center justify-center shadow-2xl shadow-violet-950/60 backdrop-blur-xl">
              <Sparkles className="w-7 h-7 text-violet-300 animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <span>Forging</span>
              <span className="bg-gradient-to-r from-violet-300 via-white to-purple-300 bg-clip-text text-transparent">
                Workspace
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-mono transition-all duration-300 h-5">
              {LOADING_STEPS[stepIndex]}
            </p>
          </div>

          {/* Sleek Progress Track with Violet/Purple Gradient */}
          <div className="w-64 sm:w-72">
            <div className="relative h-1 w-full bg-zinc-900/90 rounded-full overflow-hidden border border-white/5">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-violet-600 via-purple-400 to-indigo-500 rounded-full animate-shimmer-slide shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
