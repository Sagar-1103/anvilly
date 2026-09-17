"use client";

import { RefObject } from "react";
import type { SandboxFilesState } from "@/hooks/use-sandbox-files";
import type { Project } from "@/lib/types";
import CodeEditorView from "./code-editor/CodeEditorView";
import ExpoPreviewCard from "./preview/ExpoPreviewCard";

export default function PreviewViewport({
  device,
  activeTab,
  project,
  projectUrl,
  iframeRef,
  sandboxFiles,
}: {
  device: "desktop" | "tablet" | "mobile";
  activeTab: "preview" | "code";
  project?: Project;
  projectUrl: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  sandboxFiles: SandboxFilesState;
}) {
  const isExpo = project?.template === "node-react-native-expo";

  return (
    <div className="flex-1 overflow-auto bg-[#111113] relative flex items-center justify-center p-3">
      {activeTab === "preview" ? (
        <div
          className={`bg-zinc-950 text-white overflow-hidden shadow-2xl transition-all duration-300 ${
            isExpo || device === "mobile"
              ? "w-[375px] max-w-full h-[680px] max-h-full rounded-3xl border-[6px] border-zinc-800"
              : device === "tablet"
                ? "w-[768px] max-w-full h-[90%] max-h-full rounded-3xl border-[6px] border-zinc-800"
                : "w-full h-full rounded-xl border border-zinc-800/40"
          }`}
        >
          {isExpo ? (
            <ExpoPreviewCard
              expoUrl={project?.expoUrl}
              tunnelUrl={project?.tunnelUrl}
              projectTitle={project?.title}
            />
          ) : (
            projectUrl && (
              <iframe
                ref={iframeRef}
                src={projectUrl}
                className="w-full h-full border-0 bg-white"
                title="Preview"
              />
            )
          )}
        </div>
      ) : (
        <CodeEditorView sandboxFiles={sandboxFiles} />
      )}
    </div>
  );
}
