"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AuthModalHeader from "./auth/AuthModalHeader";
import AuthModalTabs from "./auth/AuthModalTabs";
import SocialAuthButtons from "./auth/SocialAuthButtons";
import AuthCredentialsForm from "./auth/AuthCredentialsForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clickedProvider, setClickedProvider] = useState<string | null>(null);
  const router = useRouter();

  const isAnyLoading = isSubmitting || Boolean(clickedProvider);

  useEffect(() => {
    setMode(initialMode);
    setError("");
    setIsSubmitting(false);
    setClickedProvider(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isAnyLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isAnyLoading, onClose]);

  if (!isOpen) return null;

  const getErrorMessage = (err: string) => {
    const errorMap: Record<string, string> = {
      CredentialsSignin: "Invalid email or password",
      Default: "Something went wrong. Please try again.",
    };
    return errorMap[err] || err;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyLoading) return;
    setError("");

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

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to create account.");
          setIsSubmitting(false);
          return;
        }

        toast.success("Account created! Logging you in...");
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!result?.ok) {
        const msg = getErrorMessage(result?.error || "Default");
        setError(msg);
        setIsSubmitting(false);
        return;
      }

      toast.success("Logged in successfully! Redirecting...");
      onClose();
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleProviderSignIn = async (providerId: string) => {
    if (isAnyLoading) return;
    setClickedProvider(providerId);
    setError("");
    try {
      await signIn(providerId, { callbackUrl: "/" });
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please try again.");
      setClickedProvider(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => {
        if (!isAnyLoading) onClose();
      }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-6 shadow-2xl shadow-black/80 animate-fade-in-up text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <AuthModalHeader onClose={onClose} disabled={isAnyLoading} />

        {/* Mode Switcher */}
        <AuthModalTabs mode={mode} setMode={setMode} disabled={isAnyLoading} />

        {/* Social Auth Providers */}
        <SocialAuthButtons
          loading={isAnyLoading}
          clickedProvider={clickedProvider}
          onProviderSignIn={handleProviderSignIn}
        />

        {/* Separator */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-900" />
          </div>
          <span className="relative px-3 bg-zinc-950 text-[11px] text-zinc-500 font-medium">
            Or continue with email
          </span>
        </div>

        {/* Credentials Form */}
        <AuthCredentialsForm
          mode={mode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          error={error}
          loading={isSubmitting}
          disabled={isAnyLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
