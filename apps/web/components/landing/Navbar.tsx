"use client";

import { useState, useEffect } from "react";

interface NavbarProps {
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
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
            anvilly<span className="text-zinc-500 font-normal">.</span>
          </span>
        </a>

        {/* CTA Button - Login */}
        <div className="flex items-center">
          <button
            onClick={onOpenAuth}
            className="text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-200 px-3.5 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 shadow-xs cursor-pointer"
          >
            Log in
          </button>
        </div>
      </div>
    </header>
  );
}
