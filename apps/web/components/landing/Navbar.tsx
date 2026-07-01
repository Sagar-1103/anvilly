"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

interface NavbarProps {
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userImage = session?.user?.image;
  const userEmail = session?.user?.email;
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-250 ${scrolled
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

        {/* Auth Area */}
        <div className="flex items-center">
          {status === "loading" ? (
            /* Skeleton loader while session loads */
            <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
          ) : session?.user ? (
            /* Logged-in: Avatar with dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-700 hover:border-zinc-500 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-500/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                {userImage ? (
                  <img
                    src={userImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
                    <span className="text-white text-xs font-bold leading-none">
                      {initial}
                    </span>
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-2xl shadow-black/60 overflow-hidden animate-fade-in-up">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-zinc-800/60">
                    <p className="text-xs font-semibold text-white truncate">
                      {userEmail}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      Signed in
                    </p>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in: Login button */
            <button
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
