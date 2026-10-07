"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import UserAvatarMenu from "@/components/shared/UserAvatarMenu";

interface NavbarProps {
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-250 ${
        scrolled
          ? "bg-black/80 backdrop-blur-md border-b border-zinc-900 py-2.5 shadow-xl shadow-black/40"
          : "bg-transparent border-b border-transparent py-3.5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-9">
        {/* Logo Text */}
        <a href="#" className="group flex items-center">
          <span className="text-xl font-extrabold tracking-tighter text-white font-mono transition-opacity duration-200 group-hover:opacity-80">
            anvilly
          </span>
        </a>

        {/* Auth Area */}
        <div className="flex items-center">
          {status === "loading" ? (
            /* Skeleton loader while session loads */
            <div className="w-9 h-9 rounded-full bg-zinc-800 animate-pulse" />
          ) : session?.user ? (
            /* Logged-in: Shared Avatar with dropdown */
            <UserAvatarMenu size="md" align="right" />
          ) : (
            /* Not logged in: Login button */
            <button
              type="button"
              onClick={onOpenAuth}
              className="relative group inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-violet-500/20 cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500/50 via-purple-500/30 to-violet-600/50 group-hover:from-violet-400 group-hover:to-purple-400 transition-all duration-300 rounded-full" />
              <span className="relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-zinc-200 group-hover:text-white bg-[#0a0812]/90 group-hover:bg-[#120d20]/90 rounded-full backdrop-blur-md transition-colors duration-200">
                Sign In
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
