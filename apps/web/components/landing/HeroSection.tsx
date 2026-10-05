"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import HeroHeading from "./hero/HeroHeading";
import PromptCard from "./hero/PromptCard";
import type { SuggestionItem } from "./hero/SuggestionChips";

const webQuickSuggestions: SuggestionItem[] = [
  {
    label: "Portfolio & Projects",
    prompt:
      "Build a modern developer portfolio website featuring an about me section, an interactive project showcase with category filtering and modal previews, a skills grid, and a working contact form in dark mode.",
  },
  {
    label: "Task Kanban Board",
    prompt:
      "Build a task management Kanban board with columns for To Do, In Progress, and Completed, task priority badges, search filter, and a modal to create and edit tasks.",
  },
  {
    label: "Expense & Budget Tracker",
    prompt:
      "Build a personal finance dashboard with monthly budget progress bars, spending category breakdown charts, an interactive transaction table, and a quick add expense form.",
  },
  {
    label: "Recipe & Meal Planner",
    prompt:
      "Build a recipe discovery web app with dietary category filters, keyword search, recipe cards with ingredient checklists, and a weekly meal planning schedule.",
  },
  {
    label: "Pomodoro Focus Timer",
    prompt:
      "Build a Pomodoro productivity timer with customizable work and break intervals, start/pause/reset controls, a daily session progress counter, and a simple task checklist.",
  },
  {
    label: "Markdown Notes App",
    prompt:
      "Build a clean Markdown note-taking app with a sidebar notes list, live preview split pane, search bar, and word count statistics.",
  },
];

const mobileQuickSuggestions: SuggestionItem[] = [
  {
    label: "Habit & Streak Tracker",
    prompt:
      "Build a mobile habit tracker app with daily completion checkmarks, streak day counters, weekly progress rings, habit category tags, and an add habit modal.",
  },
  {
    label: "Fitness Workout Logger",
    prompt:
      "Build a mobile workout tracker with exercise routine cards, set and rep counters, an interactive rest timer between sets, and a workout history summary.",
  },
  {
    label: "Personal Expense Tracker",
    prompt:
      "Build a mobile expense tracker with account balance summary cards, quick transaction entry form with category icons, and a monthly spending breakdown chart.",
  },
  {
    label: "Smart Grocery List",
    prompt:
      "Build a mobile grocery shopping list with category grouping (Produce, Dairy, Pantry), tap-to-complete checkboxes, quantity adjusters, and estimated total price.",
  },
  {
    label: "Flashcard Quiz App",
    prompt:
      "Build a mobile flashcard study app with smooth flip card animations, self-rating buttons (Easy, Medium, Hard), study streak statistics, and custom deck creation.",
  },
  {
    label: "Mindfulness & Sleep Timer",
    prompt:
      "Build a mobile mindfulness meditation app with ambient sound selections, customizable meditation session timer, breathing exercise animation, and daily streak log.",
  },
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
