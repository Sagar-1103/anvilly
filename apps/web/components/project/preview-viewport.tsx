"use client";

export default function PreviewViewport({
  device,
  activeTab,
}: {
  device: "desktop" | "tablet" | "mobile";
  activeTab: "preview" | "code";
}) {
  return (
    <div className="flex-1 overflow-auto bg-[#111113] relative flex items-center justify-center p-3">
      {activeTab === "preview" ? (
        /* Live Application Preview */
        <div
          className={`bg-white text-zinc-900 overflow-hidden shadow-2xl transition-all duration-300 ${
            device === "mobile"
              ? "w-93.75 h-175 rounded-4xl border-[6px] border-zinc-800"
              : device === "tablet"
                ? "w-3xl h-256 rounded-3xl border-[5px] border-zinc-800"
                : "w-full h-full rounded-xl"
          }`}
        >
          <iframe
            src="https://www.nativewind.dev/"
            className="w-full h-full border-0"
            title="Preview"
          />
        </div>
      ) : (
        /* Code Editor View */
        <div className="w-full h-full font-mono text-[13px] text-zinc-300 overflow-auto bg-[#0a0a0d] border border-white/6 rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/6 text-[11px] text-zinc-500">
            <span className="flex items-center gap-2">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              app/page.tsx
            </span>
            <span>TypeScript JSX</span>
          </div>
          <pre className="leading-relaxed whitespace-pre font-mono text-emerald-400/90">
            <code>{`export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-black text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <h1 className="text-4xl font-bold tracking-tight">Anvilly Workspace</h1>
      </div>
    </main>
  );
}`}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
