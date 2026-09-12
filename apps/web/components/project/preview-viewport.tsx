"use client";

import { RefObject } from "react";
import type { SandboxFilesState } from "@/hooks/use-sandbox-files";
import CodeEditorView from "./code-editor/CodeEditorView";

export default function PreviewViewport({
  device,
  activeTab,
  projectUrl,
  iframeRef,
  sandboxFiles,
}: {
  device: "desktop" | "tablet" | "mobile";
  activeTab: "preview" | "code";
  projectUrl: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  sandboxFiles: SandboxFilesState;
}) {
  return (
    <div className="flex-1 overflow-auto bg-[#111113] relative flex items-center justify-center p-3">
      {activeTab === "preview" ? (
        <div
          className={`bg-white text-zinc-900 overflow-hidden shadow-2xl transition-all duration-300 ${
            device === "mobile"
              ? "w-[375px] max-w-full h-[667px] max-h-full rounded-3xl border-[6px] border-zinc-800"
              : device === "tablet"
                ? "w-[768px] max-w-full h-[90%] max-h-full rounded-3xl border-[6px] border-zinc-800"
                : "w-full h-full rounded-xl"
          }`}
        >
          {projectUrl && <iframe
            ref={iframeRef}
            src={projectUrl}
            className="w-full h-full border-0"
            title="Preview"
          />}
        </div>
      ) : (
        <CodeEditorView sandboxFiles={sandboxFiles} />
      )}
    </div>
  );
}
