"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";

const quickSuggestions = [
  "Portfolio with dark mode & contact form",
  "SaaS Analytics Dashboard",
  "AI Writing Assistant with streaming",
  "E-commerce Storefront with cart",
];

export default function HeroSection() {
  const { status, data:session } = useSession();
  const [promptValue, setPromptValue] = useState("");
  const [activeTab, setActiveTab] = useState<"mobile" | "web">("web");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendPrompt = async(e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!promptValue.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/projects`,{
        userPrompt: promptValue.trim(),
      },{
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${session?.jwtToken}`
        }
      });
      const res = await response.data;

      if (res.success && res.project.id) {
        router.push(`/projects/${res.project.id}`);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to generate project:", error);
      setIsLoading(false);
    }
  }

  return (
    <section
      id="hero"
      className={`relative flex flex-col items-center justify-center px-6 pt-44 pb-28 overflow-hidden ${
        status !== "authenticated" ? "min-h-screen" : ""
      }`}
    >
      {/* Background Grid & Light Spotlight */}
      <div className="absolute inset-0 hero-grid pointer-events-none opacity-50" />
      <div className="absolute inset-0 hero-radial pointer-events-none" />

      {/* Heading */}
      <h1 className="relative z-10 text-center max-w-3xl animate-fade-in-up stagger-1">
        <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
          Forge software from pure thought.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 mt-6 text-center max-w-lg text-zinc-400 text-base sm:text-lg leading-relaxed animate-fade-in-up stagger-2">
        Anvilly shapes your prompts into production-ready web and mobile applications in seconds.
      </p>

      {/* Premium Polished Prompt Box Container */}
      <div className="relative z-10 mt-14 w-full max-w-2xl animate-fade-in-up stagger-3">
        <div className="relative group rounded-3xl p-0.5 bg-linear-to-b from-zinc-700/40 via-zinc-800/20 to-zinc-900/40 shadow-2xl shadow-black/80 transition-all duration-300 focus-within:from-zinc-500/60 focus-within:to-zinc-800/60">
          <div className="bg-[#09090c] rounded-[22px] p-4 backdrop-blur-xl border border-zinc-800/60 flex flex-col justify-between min-h-52.5">

            {/* Top Bar: Segmented Tab Pills */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800/40">
              <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/60">
                <button
                  onClick={() => setActiveTab("mobile")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === "mobile"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="5" y="2" width="14" height="20" rx="3" />
                    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Mobile app
                </button>
                <button
                  onClick={() => setActiveTab("web")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeTab === "web"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                    }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Landing Page
                </button>
              </div>
            </div>

            {/* Main Textarea */}
            <textarea
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt(e);
                }
              }}
              disabled={isLoading}
              placeholder={
                activeTab === "mobile"
                  ? "Build a mobile fitness tracking app with daily goal rings and dark UI..."
                  : "Build a modern portfolio website with a dark theme and contact form..."
              }
              rows={3}
              className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-600 text-sm sm:text-base px-2 py-1 resize-none focus:outline-none leading-relaxed disabled:opacity-60"
            />

            {/* Quick Chips Suggestion Row */}
            {!promptValue && (
              <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    disabled={isLoading}
                    onClick={() => setPromptValue(suggestion)}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-zinc-900/50 hover:bg-zinc-800 text-[11px] text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  aria-label="Attach file"
                  className="w-8 h-8 cursor-pointer rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span className="text-xs text-zinc-500 hidden sm:inline">
                  Describe features, layouts, or attach reference code
                </span>
              </div>

              {/* Generate Button with Loader / Sparkle Icon */}
              <button
                type="button"
                onClick={handleSendPrompt}
                disabled={isLoading || !promptValue.trim()}
                className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 group-hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-3.5 w-3.5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                        fill="currentColor"
                      />
                      <path
                        d="M19 2L20.25 5.75L24 7L20.25 8.25L19 12L17.75 8.25L14 7L17.75 5.75L19 2Z"
                        fill="currentColor"
                        opacity="0.7"
                      />
                    </svg>
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
