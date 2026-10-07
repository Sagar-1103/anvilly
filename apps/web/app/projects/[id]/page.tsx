"use client";

import { use, useEffect, useRef, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import ChatSidebar from "@/components/project/chat-sidebar";
import RightHeader from "@/components/project/right-header";
import PreviewViewport from "@/components/project/preview-viewport";
import ProjectNotFound from "@/components/project/ProjectNotFound";
import ProjectLoadingScreen from "@/components/project/ProjectLoadingScreen";
import ProjectEditModal from "@/components/project/ProjectEditModal";
import { useProjectIDE } from "@/hooks/use-project-ide";
import { useSandboxFiles } from "@/hooks/use-sandbox-files";

export default function ProjectIDEPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const sandboxFiles = useSandboxFiles(projectId);

  const {
    device,
    setDevice,
    activeTab,
    setActiveTab,
    project,
    messages,
    busy,
    liveThought,
    iframeRef,
    isPreviewReady,
    reloadProjectLink,
    sendPrompt,
    handleAnswerSubmit,
    loading,
    error,
    getProject,
    updateProjectDetails,
  } = useProjectIDE(projectId, sandboxFiles.handleFileChange);

  const hasFetchedFiles = useRef(false);
  useEffect(() => {
    if (!loading && !error && !hasFetchedFiles.current) {
      hasFetchedFiles.current = true;
      sandboxFiles.fetchFileTree();
    }
  }, [loading, error, sandboxFiles]);

  useEffect(() => {
    if (
      activeTab === "code" &&
      sandboxFiles.filePaths.length === 0 &&
      !sandboxFiles.loading
    ) {
      sandboxFiles.fetchFileTree();
    }
  }, [activeTab, sandboxFiles]);

  const prevBusyRef = useRef(false);
  useEffect(() => {
    if (prevBusyRef.current && !busy) {
      sandboxFiles.fetchFileTree();
    }
    prevBusyRef.current = busy;
  }, [busy, sandboxFiles]);

  if (loading) {
    return <ProjectLoadingScreen projectId={projectId} />;
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
      <div className="flex h-screen w-screen bg-[#18181b] text-zinc-100 overflow-hidden antialiased">
        <ChatSidebar
          project={project}
          messages={messages}
          busy={busy}
          liveThought={liveThought}
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
            onEdit={() => setIsEditModalOpen(true)}
            isPreviewReady={isPreviewReady}
          />
          <PreviewViewport
            device={device}
            activeTab={activeTab}
            project={project}
            projectUrl={project.url}
            iframeRef={iframeRef}
            sandboxFiles={sandboxFiles}
            isPreviewReady={isPreviewReady}
            liveThought={liveThought}
          />
        </main>
      </div>

      <ProjectEditModal
        isOpen={isEditModalOpen}
        project={{
          id: projectId,
          title: project.title,
          description: project.description,
        }}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (newTitle, newDesc) => {
          await updateProjectDetails(newTitle, newDesc);
        }}
      />
    </SidebarProvider>
  );
}
