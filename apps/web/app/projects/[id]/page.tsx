"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/project/chat-sidebar";
import RightHeader from "@/components/project/right-header";
import PreviewViewport from "@/components/project/preview-viewport";
import ProjectNotFound from "@/components/project/ProjectNotFound";
import { useProjectIDE } from "@/hooks/use-project-ide";

export default function ProjectIDEPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);

  const {
    device,
    setDevice,
    activeTab,
    setActiveTab,
    project,
    messages,
    busy,
    iframeRef,
    reloadProjectLink,
    sendPrompt,
    handleAnswerSubmit,
    loading,
    error,
    getProject,
  } = useProjectIDE(projectId);

  if (loading) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 antialiased overflow-hidden select-none">
        <div className="absolute inset-0 hero-grid pointer-events-none opacity-40" />
        <div className="absolute inset-0 hero-radial pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <span className="text-2xl font-extrabold tracking-tighter text-white font-mono animate-pulse">
            anvilly
          </span>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            <span>Loading workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ProjectNotFound
        projectId={projectId}
        error={error}
        onRetry={getProject}
      />
    );
  }

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "400px",
          "--sidebar-width-icon": "0px",
        } as React.CSSProperties
      }
    >
      <div className="flex h-screen w-screen bg-black text-white overflow-hidden antialiased">
        <ChatSidebar
          project={project}
          messages={messages}
          busy={busy}
          sendPrompt={(promptText) => sendPrompt(promptText, false)}
          onAnswerSubmit={handleAnswerSubmit}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <RightHeader
            device={device}
            setDevice={setDevice}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reloadProjectLink={reloadProjectLink}
            project={project}
          />
          <PreviewViewport
            device={device}
            activeTab={activeTab}
            projectUrl={project.url}
            iframeRef={iframeRef}
          />
        </main>
      </div>
    </SidebarProvider>
  );
}
