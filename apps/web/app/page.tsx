"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProjectShowcase from "@/components/landing/ProjectShowcase";
import Footer from "@/components/landing/Footer";
import AuthModal from "@/components/landing/AuthModal";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar onOpenAuth={() => setIsAuthOpen(true)} />
      <HeroSection />
      <ProjectShowcase />
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
