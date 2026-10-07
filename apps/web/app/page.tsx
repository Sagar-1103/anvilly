"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProjectShowcase from "@/components/landing/ProjectShowcase";
import AuthModal from "@/components/landing/AuthModal";
import LiveAuroraBackground from "@/components/landing/LiveAuroraBackground";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { status } = useSession();

  return (
    <div className="relative min-h-screen bg-[#030006] text-white overflow-x-hidden flex flex-col">
      {/* ===== LIVE INTERACTIVE VIOLET AURORA BACKGROUND ===== */}
      <LiveAuroraBackground />

      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        <HeroSection onOpenAuth={() => setIsAuthOpen(true)} />
        {status === "authenticated" && <ProjectShowcase />}
      </main>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

