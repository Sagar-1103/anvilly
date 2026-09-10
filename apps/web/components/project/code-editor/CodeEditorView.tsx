"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { MOCK_PROJECT_FILES, ProjectFile } from "./mock-project-files";
import FileTreeSidebar from "./FileTreeSidebar";
import EditorTabBar from "./EditorTabBar";
import EditorStatusBar from "./EditorStatusBar";

export default function CodeEditorView() {
  const [files] = useState<ProjectFile[]>(MOCK_PROJECT_FILES);
  const [activeFile, setActiveFile] = useState<ProjectFile>(MOCK_PROJECT_FILES[0]);
  const [openTabs, setOpenTabs] = useState<ProjectFile[]>([
    MOCK_PROJECT_FILES[0], // page.tsx
    MOCK_PROJECT_FILES[1], // layout.tsx
    MOCK_PROJECT_FILES[6], // package.json
  ]);

  const handleSelectFile = (file: ProjectFile) => {
    setActiveFile(file);
    if (!openTabs.some((t) => t.id === file.id)) {
      setOpenTabs((prev) => [...prev, file]);
    }
  };

  const handleCloseTab = (fileId: string) => {
    const nextTabs = openTabs.filter((t) => t.id !== fileId);
    if (nextTabs.length === 0) return;

    setOpenTabs(nextTabs);
    if (activeFile.id === fileId) {
      setActiveFile(nextTabs[nextTabs.length - 1]);
    }
  };

  const lineCount = activeFile.content.split("\n").length;

  return (
    <div className="w-full h-full flex bg-[#0d0d11] rounded-xl overflow-hidden border border-white/6 shadow-2xl">
      {/* File Tree Explorer (Codebar) */}
      <FileTreeSidebar
        files={files}
        activeFile={activeFile}
        onSelectFile={handleSelectFile}
      />

      {/* Editor & Tabs */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#1e1e1e]">
        {/* Tab Bar with Breadcrumbs */}
        <EditorTabBar
          openTabs={openTabs}
          activeFile={activeFile}
          onSelectTab={setActiveFile}
          onCloseTab={handleCloseTab}
        />

        {/* Monaco Editor Instance */}
        <div className="flex-1 w-full min-h-0 overflow-hidden relative">
          <Editor
            height="100%"
            width="100%"
            language={activeFile.language}
            value={activeFile.content}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 13.5,
              lineHeight: 21,
              fontFamily:
                "'Consolas', 'Cascadia Code', 'Menlo', 'Monaco', 'Courier New', monospace",
              fontLigatures: true,
              letterSpacing: 0,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              lineNumbers: "on",
              renderLineHighlight: "all",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              padding: { top: 14, bottom: 14 },
              folding: true,
              wordWrap: "on",
            }}
            loading={
              <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e] text-zinc-500 font-mono text-xs gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-zinc-400"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading Monaco Editor...
              </div>
            }
          />
        </div>

        {/* Editor Bottom Status Bar */}
        <EditorStatusBar activeFile={activeFile} lineCount={lineCount} />
      </div>
    </div>
  );
}
