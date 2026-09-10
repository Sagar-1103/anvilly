"use client";

interface AuthModalTabsProps {
  mode: "login" | "signup";
  setMode: (mode: "login" | "signup") => void;
  disabled?: boolean;
}

export default function AuthModalTabs({
  mode,
  setMode,
  disabled = false,
}: AuthModalTabsProps) {
  return (
    <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/80 mb-6">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setMode("login")}
        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
          mode === "login"
            ? "bg-zinc-800 text-white shadow-xs"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        Log in
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setMode("signup")}
        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
          mode === "signup"
            ? "bg-zinc-800 text-white shadow-xs"
            : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        Sign up
      </button>
    </div>
  );
}
