"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clickedProvider, setClickedProvider] = useState<string | null>(null);
  const router = useRouter();

  const providers: { id: string; name: string; icon: ReactNode }[] = [
    {
      id: "google",
      name: "Google",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
          <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
          <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
        </svg>
      ),
    },
    {
      id: "github",
      name: "GitHub",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      ),
    },
    {
      id: "discord",
      name: "Discord",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.319 13.58.099 18.058a.082.082 0 00.031.056c2.053 1.508 4.041 2.423 5.993 3.03a.078.078 0 00.084-.028c.462-.63.873-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.079.01c.12.098.245.197.372.292a.077.077 0 01-.006.128 12.299 12.299 0 01-1.873.891.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028c1.961-.607 3.95-1.522 6.002-3.03a.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
        </svg>
      ),
    },
  ];

  const getErrorMessage = (error: string) => {
    const errorMap: Record<string, string> = {
      CredentialsSignin: "Invalid email or password",
      Default: "Something went wrong. Please try again.",
    };
    return errorMap[error] || error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        // Register first
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to create account.");
          setLoading(false);
          return;
        }

        toast.success("Account created! Logging you in...");
      }

      // Sign in with credentials
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!result?.ok) {
        const msg = getErrorMessage(result?.error || "Default");
        setError(msg);
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully! Redirecting...");
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (providerId: string) => {
    if (loading) return;
    setLoading(true);
    setClickedProvider(providerId);
    setError("");
    try {
      await signIn(providerId, { callbackUrl: "/" });
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please try again.");
      setClickedProvider(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    setMode(initialMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setClickedProvider(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop: Dark Overlay without blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 animate-fade-in cursor-pointer"
      />

      {/* Modal Wrapper matching Hero Prompt Box Container */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl p-0.5 bg-linear-to-b from-zinc-700/50 via-zinc-800/30 to-zinc-900/50 shadow-2xl shadow-black animate-fade-in-up">
        <div className="bg-[#09090c] rounded-[22px] p-6 backdrop-blur-xl border border-zinc-800/80 relative">

          {/* Close Button */}
          <button
            disabled={loading}
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center border border-zinc-800/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Dynamic Header based on mode */}
          <div className="mb-5">
            <span className="text-xl font-extrabold tracking-tighter text-white font-mono block mb-2">
              anvilly<span className="text-zinc-500 font-normal">.</span>
            </span>
            <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              {mode === "login" ? "Welcome back" : "Start forging"}
            </p>
            <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
              {mode === "login" ? "Log in to Anvilly" : "Create your account"}
            </h2>
          </div>

          {/* Social Auth Providers */}
          <div className="space-y-2 mb-4">
            {providers.map(({ id, name, icon }) => (
              <button
                key={id}
                disabled={loading}
                onClick={() => handleProviderSignIn(id)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {clickedProvider === id ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-zinc-200" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  icon
                )}
                {clickedProvider === id ? (
                  "Connecting..."
                ) : (
                  mode === "login" ? `Login with ${name}` : `Sign up with ${name}`
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800/60" />
            </div>
            <span className="relative bg-[#09090c] px-2.5 text-[10px] font-mono text-zinc-500 uppercase">
              OR
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 text-xs text-red-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <input
                disabled={loading}
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="Email"
                className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <input
                disabled={loading}
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Password"
                className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {mode === "signup" && (
              <div>
                <input
                  disabled={loading}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Confirm password"
                  className="w-full bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs text-zinc-100 placeholder:text-zinc-600 px-3.5 py-2.5 focus:outline-none focus:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-1 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && !clickedProvider && (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading && !clickedProvider
                ? (mode === "login" ? "Logging in..." : "Creating account...")
                : (mode === "login" ? "Log in" : "Create Account")
              }
            </button>
          </form>

          {/* Mode Toggle Footer Link */}
          <div className="mt-4 pt-3.5 border-t border-zinc-900 text-center">
            {mode === "login" ? (
              <p className="text-xs text-zinc-500">
                Don&apos;t have an account?{" "}
                <button
                  disabled={loading}
                  onClick={() => setMode("signup")}
                  className="text-white hover:underline font-semibold transition-all cursor-pointer ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-xs text-zinc-500">
                Already have an account?{" "}
                <button
                  disabled={loading}
                  onClick={() => setMode("login")}
                  className="text-white hover:underline font-semibold transition-all cursor-pointer ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Log in
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
