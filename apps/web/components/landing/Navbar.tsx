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
          ? "bg-black/80 backdrop-blur-md border-b border-zinc-900 py-3 shadow-xl shadow-black/40"
          : "bg-transparent border-b border-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-8">
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
            <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
          ) : session?.user ? (
            /* Logged-in: Shared Avatar with dropdown */
            <UserAvatarMenu size="md" align="right" />
          ) : (
            /* Not logged in: Login button */
            <button
              type="button"
              onClick={onOpenAuth}
              className="text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-200 px-3.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 shadow-xs cursor-pointer"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
