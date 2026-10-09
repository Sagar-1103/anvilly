"use client";

import { useSession } from "next-auth/react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProjectShowcase from "@/components/landing/ProjectShowcase";
import LiveAuroraBackground from "@/components/landing/LiveAuroraBackground";
import { useCredentials } from "@/contexts/credential-context";

export default function Home() {
  const { status } = useSession();
  const { openAuthModal } = useCredentials();

  return (
    <div className="relative min-h-screen bg-[#030006] text-white overflow-x-hidden flex flex-col">
      {/* ===== LIVE INTERACTIVE VIOLET AURORA BACKGROUND ===== */}
      <LiveAuroraBackground />

      <Navbar onOpenAuth={openAuthModal} />
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        <HeroSection onOpenAuth={openAuthModal} />
        {status === "authenticated" && <ProjectShowcase />}
      </main>
    </div>
  );
}

