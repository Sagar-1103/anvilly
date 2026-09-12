"use client";

import Editor from "@monaco-editor/react";
import type { SandboxFilesState } from "@/hooks/use-sandbox-files";
import FileTreeSidebar from "./FileTreeSidebar";
import EditorTabBar from "./EditorTabBar";
import EditorStatusBar from "./EditorStatusBar";
import { Code2, Loader2, Sparkles } from "lucide-react";

interface CodeEditorViewProps {
  sandboxFiles: SandboxFilesState;
}

export default function CodeEditorView({ sandboxFiles }: CodeEditorViewProps) {
  const {
    fileTree,
    filePaths,
    activeFile,
    openTabs,
    loading,
    fileLoading,
    recentlyChanged,
    autoFollow,
    setAutoFollow,
    selectFile,
    closeTab,
    setActiveFile,
  } = sandboxFiles;

  const lineCount = activeFile ? activeFile.content.split("\n").length : 0;

  /* ─── Loading state: fetching file tree ─── */
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0d0d11] rounded-xl border border-white/6 shadow-2xl">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-300">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          <span className="text-xs font-mono text-zinc-500">
            Loading project files...
          </span>
        </div>
      </div>
    );
  }

  /* ─── Empty state: no files generated yet ─── */
  if (filePaths.length === 0 && !activeFile) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0d0d11] rounded-xl border border-white/6 shadow-2xl">
        <div className="flex flex-col items-center gap-4 max-w-xs text-center animate-in fade-in duration-500">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
              <Code2 className="w-7 h-7 text-zinc-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-zinc-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-zinc-400">
              Waiting for code generation
            </p>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Files will appear here as the AI generates your project.
              Send a prompt to get started.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-500">
              sandbox ready
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex bg-[#0d0d11] rounded-xl overflow-hidden border border-white/6 shadow-2xl">
      {/* File Tree Explorer */}
      <FileTreeSidebar
        fileTree={fileTree}
        activeFilePath={activeFile?.path ?? null}
        recentlyChanged={recentlyChanged}
        onSelectFile={selectFile}
      />

      {/* Editor & Tabs */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#1e1e1e]">
        {/* Tab Bar */}
        <EditorTabBar
          openTabs={openTabs}
          activeFile={activeFile}
          onSelectTab={(file) => setActiveFile(file)}
          onCloseTab={closeTab}
          autoFollow={autoFollow}
          onToggleAutoFollow={() => setAutoFollow(!autoFollow)}
        />

        {/* Monaco Editor */}
        <div className="flex-1 w-full min-h-0 overflow-hidden relative">
          {activeFile ? (
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
                  <Loader2 className="animate-spin h-4 w-4 text-zinc-400" />
                  Loading editor...
                </div>
              }
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e]">
              <div className="text-center space-y-2">
                <Code2 className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-600 font-mono">
                  Select a file to view
                </p>
              </div>
            </div>
          )}

          {/* Loading overlay when fetching file content */}
          {fileLoading && (
            <div className="absolute inset-0 bg-[#1e1e1e]/80 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reading file...</span>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        {activeFile && (
          <EditorStatusBar activeFile={activeFile} lineCount={lineCount} />
        )}
      </div>
    </div>
  );
}
