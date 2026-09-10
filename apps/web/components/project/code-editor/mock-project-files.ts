export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  language: string; // "typescript", "css", "json", "html"
  content: string;
  folder?: string;
}

export interface FolderNode {
  name: string;
  files: ProjectFile[];
  folders?: FolderNode[];
}

export const MOCK_PROJECT_FILES: ProjectFile[] = [
  {
    id: "app-page",
    name: "page.tsx",
    path: "app/page.tsx",
    language: "typescript",
    folder: "app",
    content: `"use client";

import { useState } from "react";
import HeroCard from "@/components/hero-card";
import Navbar from "@/components/navbar";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16 space-y-12">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Built with Anvilly Engine
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Craft Next-Gen Applications at Warp Speed
          </h1>
          
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Production-ready fullstack architecture with instant sandbox preview, real-time code generation, and intuitive workspace controls.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <HeroCard
            title="Real-Time Streaming"
            description="Experience live code generation and instant interactive preview updates."
            badge="Streaming"
          />
          <HeroCard
            title="Isolated Sandboxes"
            description="Every project runs inside a secured cloud micro-environment with full Node.js support."
            badge="E2B Engine"
          />
          <HeroCard
            title="Production Ready"
            description="Clean Next.js App Router code ready to export, clone, or deploy straight to Vercel."
            badge="Next.js 15"
          />
        </div>
      </main>
    </div>
  );
}
`,
  },
  {
    id: "app-layout",
    name: "layout.tsx",
    path: "app/layout.tsx",
    language: "typescript",
    folder: "app",
    content: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anvilly Generated Workspace",
  description: "Crafted with Anvilly AI Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={\`\${inter.className} bg-black text-white antialiased\`}>
        {children}
      </body>
    </html>
  );
}
`,
  },
  {
    id: "app-globals-css",
    name: "globals.css",
    path: "app/globals.css",
    language: "css",
    folder: "app",
    content: `@import "tailwindcss";

@layer base {
  :root {
    --background: #000000;
    --foreground: #ffffff;
    --border: rgba(255, 255, 255, 0.08);
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }
}

/* Custom subtle scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
`,
  },
  {
    id: "components-hero-card",
    name: "hero-card.tsx",
    path: "components/hero-card.tsx",
    language: "typescript",
    folder: "components",
    content: `interface HeroCardProps {
  title: string;
  description: string;
  badge: string;
}

export default function HeroCard({ title, description, badge }: HeroCardProps) {
  return (
    <div className="group relative rounded-2xl p-6 bg-zinc-950 border border-white/8 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-white/[0.02]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/5 text-zinc-400 border border-white/8">
          {badge}
        </span>
      </div>

      <h3 className="text-base font-semibold text-white tracking-tight mb-2 group-hover:text-zinc-100">
        {title}
      </h3>

      <p className="text-xs text-zinc-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
`,
  },
  {
    id: "components-navbar",
    name: "navbar.tsx",
    path: "components/navbar.tsx",
    language: "typescript",
    folder: "components",
    content: `export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-black/80 backdrop-blur-md border-b border-white/8 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2 font-mono font-bold text-white text-sm">
        <span className="w-2 h-2 rounded-full bg-white" />
        anvilly.project
      </div>

      <nav className="flex items-center gap-4 text-xs text-zinc-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#preview" className="hover:text-white transition-colors">Live Preview</a>
        <button className="px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition-colors">
          Deploy
        </button>
      </nav>
    </header>
  );
}
`,
  },
  {
    id: "lib-utils",
    name: "utils.ts",
    path: "lib/utils.ts",
    language: "typescript",
    folder: "lib",
    content: `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`,
  },
  {
    id: "package-json",
    name: "package.json",
    path: "package.json",
    language: "json",
    content: `{
  "name": "anvilly-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.2.0",
    "lucide-react": "^1.21.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0"
  }
}
`,
  },
  {
    id: "tsconfig-json",
    name: "tsconfig.json",
    path: "tsconfig.json",
    language: "json",
    content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
  },
];
