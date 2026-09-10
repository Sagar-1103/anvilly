"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";

interface UserAvatarMenuProps {
  size?: "sm" | "md";
  align?: "left" | "right";
}

export default function UserAvatarMenu({
  size = "md",
  align = "right",
}: UserAvatarMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

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

  const sizeClasses =
    size === "sm"
      ? "w-6 h-6 text-[10px]"
      : "w-8 h-8 text-xs";

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`relative ${sizeClasses} rounded-full overflow-hidden border border-white/10 hover:border-white/30 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/20 flex items-center justify-center`}
          title={userEmail || "Account"}
        >
          {userImage ? (
            <img
              src={userImage}
              alt="Profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold leading-none">
                {initial}
              </span>
            </div>
          )}
        </button>

        {dropdownOpen && (
          <div
            className={`absolute ${
              align === "right" ? "right-0" : "left-0"
            } mt-2 w-56 rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-2xl shadow-black/80 overflow-hidden animate-fade-in-up z-50`}
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-zinc-800/60 text-left">
              <p className="text-xs font-semibold text-white truncate">
                {userEmail}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Signed in
              </p>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                setShowConfirmModal(true);
              }}
              className="w-full text-left px-4 py-2.5 text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition-all duration-150 cursor-pointer flex items-center gap-2 group"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors" />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>

      <LogoutConfirmModal
        isOpen={showConfirmModal}
        userEmail={userEmail}
        onClose={() => {
          if (!isLoggingOut) setShowConfirmModal(false);
        }}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}
