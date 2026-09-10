"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut, Loader2, X } from "lucide-react";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  userEmail?: string | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
}

export default function LogoutConfirmModal({
  isOpen,
  userEmail,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoggingOut) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoggingOut, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={() => {
        if (!isLoggingOut) onClose();
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800/80 p-6 shadow-2xl shadow-black/80 animate-fade-in-up text-left space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={isLoggingOut}
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Danger Accent */}
        <div className="flex items-start gap-3 text-red-400">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 shrink-0">
            <LogOut className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug">
              Log out
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Are you sure you want to log out?
            </p>
          </div>
        </div>

        {/* User Account Info Chip */}
        {userEmail && (
          <div className="text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">
              Signed in as <strong className="text-zinc-200 font-medium">{userEmail}</strong>
            </span>
          </div>
        )}

        <p className="text-xs text-zinc-400 leading-relaxed">
          You will be signed out of this session and returned to the home page.
        </p>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-red-950/40 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
