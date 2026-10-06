"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useLocalStorage } from "@/hooks/use-local-storage";
import HeroHeading from "./hero/HeroHeading";
import PromptCard from "./hero/PromptCard";
import { webQuickSuggestions, mobileQuickSuggestions } from "@/data/suggestions";

interface HeroSectionProps {
  onOpenAuth?: () => void;
}

export default function HeroSection({ onOpenAuth }: HeroSectionProps = {}) {
  const { status, data: session } = useSession();
  const [promptValue, setPromptValue] = useLocalStorage("anvilly_pending_prompt", "");
  const [activeTab, setActiveTab] = useLocalStorage<"mobile" | "web">("anvilly_active_tab", "web");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendPrompt = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!promptValue.trim() || isLoading) return;

    if (status !== "authenticated") {
      onOpenAuth?.();
      return;
    }

    setIsLoading(true);
    try {
      const selectedTemplate =
        activeTab === "mobile" ? "node_react_native_expo" : "bun_react_shadcn";

      const response = await axios.post(
        `${BACKEND_URL}/api/projects`,
        {
          userPrompt: promptValue.trim(),
          template: selectedTemplate,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.jwtToken}`,
          },
        }
      );
      const res = await response.data;

      if (res.success && res.project.id) {
        setPromptValue(""); // Use setter instead of direct localStorage manipulation
        router.push(`/projects/${res.project.id}`);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to generate project:", error);
      setIsLoading(false);
    }
  };

  const quickSuggestions =
    activeTab === "mobile" ? mobileQuickSuggestions : webQuickSuggestions;

  return (
    <section
      id="hero"
      className={`relative flex flex-col items-center justify-center px-6 pt-44 pb-28 overflow-hidden ${
        status !== "authenticated" ? "min-h-screen" : ""
      }`}
    >
      <HeroHeading />

      <PromptCard
        promptValue={promptValue}
        setPromptValue={setPromptValue}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isLoading}
        quickSuggestions={quickSuggestions}
        onSendPrompt={handleSendPrompt}
      />
    </section>
  );
}
