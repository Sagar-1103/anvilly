"use client";

import { RefObject } from "react";
import type { SandboxFilesState } from "@/hooks/use-sandbox-files";
import type { Project } from "@/lib/types";
import CodeEditorView from "./code-editor/CodeEditorView";
import ExpoPreviewCard from "./preview/ExpoPreviewCard";
import { Wifi } from "lucide-react";

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
  const isExpo = project?.template === "node_react_native_expo";
  const isMobileView = isExpo || device === "mobile";

  return (
    <div className="flex-1 overflow-auto bg-[#111113] relative flex items-center justify-center p-4">
      {activeTab === "preview" ? (
        isMobileView ? (
          /* Sleek Phone Mockup Frame */
          <div className="relative w-[380px] max-w-full h-[740px] max-h-[94%] rounded-[48px] p-2.5 bg-zinc-900 border border-zinc-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)] flex flex-col shrink-0 transition-all duration-300 select-none">
            {/* Side button accents */}
            <div className="absolute -left-[3px] top-24 w-[3px] h-7 bg-zinc-700/80 rounded-l-xs" />
            <div className="absolute -left-[3px] top-36 w-[3px] h-7 bg-zinc-700/80 rounded-l-xs" />
            <div className="absolute -right-[3px] top-28 w-[3px] h-10 bg-zinc-700/80 rounded-r-xs" />

            {/* Inner Phone Screen */}
            <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col border border-zinc-800/80">
              {isExpo ? (
                <ExpoPreviewCard
                  expoUrl={project?.expoUrl}
                  tunnelUrl={project?.tunnelUrl}
                  projectTitle={project?.title}
                />
              ) : (
                /* Mobile Web View */
                <div className="w-full h-full flex flex-col bg-white">
                  {/* Status Bar for Mobile Web Preview */}
                  <div className="w-full bg-black text-white px-5 pt-2 pb-1.5 flex items-center justify-between shrink-0 select-none">
                    <span className="text-[11px] font-semibold tracking-tight text-zinc-300 w-10">
                      9:41
                    </span>
                    <div className="w-20 h-4 bg-black rounded-full border border-zinc-800 flex items-center justify-end px-2 shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-300 w-10 justify-end">
                      <Wifi className="w-3 h-3 text-zinc-300" />
                      <div className="w-4 h-2 border border-zinc-400 rounded-[2px] p-[1px] flex items-center">
                        <div className="h-full w-2 bg-zinc-200 rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {projectUrl && (
                    <iframe
                      ref={iframeRef}
                      src={projectUrl}
                      className="w-full flex-1 border-0 bg-white"
                      title="Preview"
                    />
                  )}

                  {/* Home Indicator */}
                  <div className="w-full bg-black py-1.5 shrink-0 flex justify-center">
                    <div className="w-28 h-1 bg-zinc-600/70 rounded-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : device === "tablet" ? (
          <div className="w-[768px] max-w-full h-[90%] max-h-full rounded-2xl p-2 bg-zinc-900 border border-zinc-700/60 shadow-2xl transition-all duration-300">
            <div className="w-full h-full rounded-xl overflow-hidden bg-white">
              {projectUrl && (
                <iframe
                  ref={iframeRef}
                  src={projectUrl}
                  className="w-full h-full border-0 bg-white"
                  title="Preview"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full rounded-xl border border-zinc-800/40 overflow-hidden bg-white transition-all duration-300">
            {projectUrl && (
              <iframe
                ref={iframeRef}
                src={projectUrl}
                className="w-full h-full border-0 bg-white"
                title="Preview"
              />
            )}
          </div>
        )
      ) : (
        <CodeEditorView sandboxFiles={sandboxFiles} />
      )}
    </div>
  );
}
