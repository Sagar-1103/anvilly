"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProjectShowcase from "@/components/landing/ProjectShowcase";
import AuthModal from "@/components/landing/AuthModal";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { status } = useSession();

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden flex flex-col">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <main className="flex-1 flex flex-col justify-center">
        <HeroSection />
        {status === "authenticated" && <ProjectShowcase />}
      </main>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

