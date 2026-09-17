"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import HeroHeading from "./hero/HeroHeading";
import PromptCard from "./hero/PromptCard";

const webQuickSuggestions = [
  "Portfolio with dark mode & contact form",
  "SaaS Analytics Dashboard",
  "AI Writing Assistant with streaming",
  "E-commerce Storefront with cart",
];

const mobileQuickSuggestions = [
  "Crypto wallet with cards & transactions",
  "Fitness tracker with activity rings & dark UI",
  "Food delivery app with menu & cart",
  "Habit tracker with streak calendar & analytics",
];

interface HeroSectionProps {
  onOpenAuth?: () => void;
}

export default function HeroSection({ onOpenAuth }: HeroSectionProps = {}) {
  const { status, data: session } = useSession();
  const [promptValue, setPromptValue] = useState("");
  const [activeTab, setActiveTab] = useState<"mobile" | "web">("web");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedPrompt = localStorage.getItem("anvilly_pending_prompt");
    if (savedPrompt) {
      setPromptValue(savedPrompt);
    }
  }, []);

  useEffect(() => {
    if (promptValue) {
      localStorage.setItem("anvilly_pending_prompt", promptValue);
    } else {
      localStorage.removeItem("anvilly_pending_prompt");
    }
  }, [promptValue]);

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
        activeTab === "mobile" ? "node-react-native-expo" : "bun-react-shadcn";

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
        localStorage.removeItem("anvilly_pending_prompt");
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
