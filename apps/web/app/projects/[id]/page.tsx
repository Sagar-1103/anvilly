"use client";

import { use, useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

/* ─────────── Types ─────────── */
interface Message {
  id: string;
  role: "user" | "assistant";
  ts?: string;
  body?: string;
  thinking?: string;
  card?: { title: string; tabs: string[] };
  bullets?: { heading: string; items: string[] };
  note?: string;
}

/* ─────────── Seed data ─────────── */
const seed: Message[] = [
  {
    id: "1",
    role: "user",
    ts: "Jun 26 at 9:49 PM",
    body: "build a todo app",
  },
  {
    id: "2",
    role: "assistant",
    thinking: "Thought for 4s",
    body: "Let me enable Anvilly Cloud first since a todo app needs a database for persistence.",
    card: { title: "Built todo app with auth", tabs: ["Details", "Preview"] },
    bullets: {
      heading: "Features:",
      items: [
        "Sign up / sign in with email and password, or Google OAuth",
        "Add new tasks with a clean input field",
        "Mark tasks as complete with checkboxes",
        "Delete individual tasks (hover to reveal the trash icon)",
        "Filter tasks by All, Active, or Completed",
        "Clear all completed tasks at once",
        "Secure per-user data — your todos are private and persist in the database",
      ],
    },
    note: "Warm amber/cream palette with a clean, minimal card-based layout.",
  },
];

const chips = [
  "Add task editing",
  "Implement due dates",
  "Add search and keyboard",
  "Support drag and drop",
];

/* ─────────── Main Page ─────────── */
export default function ProjectIDEPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  return (
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width": "400px", "--sidebar-width-icon": "0px" } as React.CSSProperties}
    >
      <div className="flex h-screen w-screen bg-black text-white overflow-hidden antialiased">
        {/* LEFT: shadcn Sidebar */}
        <ChatSidebar />

        {/* RIGHT: Main content area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <RightHeader device={device} setDevice={setDevice} activeTab={activeTab} setActiveTab={setActiveTab} />
          <PreviewViewport device={device} activeTab={activeTab} />
        </main>
      </div>
    </SidebarProvider>
  );
}

/* ═══════════════════════════════════════════
   CHAT SIDEBAR (inside shadcn Sidebar)
   ═══════════════════════════════════════════ */
function ChatSidebar() {
  const [msgs, setMsgs] = useState<Message[]>(seed);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    const txt = prompt.trim();
    if (!txt || busy) return;
    setMsgs((m) => [...m, { id: Date.now().toString(), role: "user", body: txt }]);
    setPrompt("");
    setBusy(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          thinking: "Thought for 2s",
          body: `Done! I've updated the app based on "${txt}". Preview is live.`,
        },
      ]);
      setBusy(false);
    }, 1400);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/[0.06]">
      {/* Sidebar Top Header — project name */}
      <SidebarHeader className="h-12 px-4 flex flex-row items-center gap-3 border-b border-white/[0.06] shrink-0 bg-black">
        <Link href="/" className="shrink-0">
          <span className="text-[15px] font-extrabold tracking-tighter font-mono text-white">
            anvilly<span className="text-zinc-600 font-normal">.</span>
          </span>
        </Link>
        <span className="h-4 w-px bg-white/[0.08]" />
        <button className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors truncate">
          Your Daily Tasks
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-600 shrink-0">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </SidebarHeader>

      {/* Chat Messages */}
      <SidebarContent className="!p-0 flex-1 overflow-hidden">
        <div ref={feedRef} className="h-full overflow-y-auto px-4 pt-4 pb-6 space-y-4 text-[13px] leading-[1.6]">
          {msgs.map((m) => (
            <div key={m.id}>
              {m.ts && <p className="text-center text-[11px] text-zinc-600 font-mono mb-3">{m.ts}</p>}

              {m.role === "user" && (
                <div className="flex justify-end">
                  <div className="bg-white/[0.07] border border-white/[0.06] text-zinc-200 px-4 py-2 rounded-2xl rounded-br-md max-w-[85%] text-[13px]">
                    {m.body}
                  </div>
                </div>
              )}

              {m.role === "assistant" && (
                <div className="space-y-3 text-[13px]">
                  {m.thinking && (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {m.thinking}
                    </div>
                  )}

                  {m.body && <p className="text-zinc-400">{m.body}</p>}

                  {m.card && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-[13px]">{m.card.title}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {m.card.tabs.map((t) => (
                          <button key={t} className="py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-zinc-400 text-[11px] font-medium hover:text-white hover:bg-white/[0.07] transition-colors">{t}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.bullets && (
                    <div className="space-y-1.5 text-[13px]">
                      <p className="font-semibold text-zinc-200">{m.bullets.heading}</p>
                      <ul className="space-y-1 text-zinc-500 pl-4 list-disc marker:text-zinc-700">
                        {m.bullets.items.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    </div>
                  )}

                  {m.note && (
                    <p className="text-zinc-500 text-[13px]">
                      <span className="font-medium text-zinc-300">Design: </span>{m.note}
                    </p>
                  )}

                  <p className="text-zinc-500 text-[13px]">
                    Try it out in the Preview — you can create an account and start adding tasks.
                  </p>
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="flex items-center gap-2 text-zinc-500 text-[12px] font-mono py-2">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" /><span className="inline-flex rounded-full h-2 w-2 bg-white" /></span>
              Anvilly is forging...
            </div>
          )}
        </div>
      </SidebarContent>

      {/* Quick Chips + Prompt Input */}
      <SidebarFooter className="!p-0 border-t border-white/[0.06] bg-black">
        {/* Prompt box */}
        <div className="p-3">
          <form onSubmit={send} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex flex-col min-h-[96px] focus-within:border-white/[0.12] transition-colors">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask Anvilly..."
              rows={2}
              className="flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/[0.04]">
              <button type="button" className="w-6 h-6 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-500 hover:text-white flex items-center justify-center transition-colors">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <div className="flex items-center gap-2">
                <button type="button" className="text-[11px] text-zinc-500 hover:text-zinc-300 font-medium flex items-center gap-0.5">
                  Build <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <button type="button" className="text-zinc-500 hover:text-zinc-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></svg>
                </button>
                <button type="submit" disabled={!prompt.trim() || busy} className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center disabled:opacity-20 hover:bg-zinc-200 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
                </button>
              </div>
            </div>
          </form>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

/* ═══════════════════════════════════════════
   RIGHT HEADER (above preview/code viewport)
   ═══════════════════════════════════════════ */
function RightHeader({
  device,
  setDevice,
  activeTab,
  setActiveTab,
}: {
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
  activeTab: "preview" | "code";
  setActiveTab: (t: "preview" | "code") => void;
}) {
  const { toggleSidebar, state } = useSidebar();
  const [page, setPage] = useState("/");
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [pageSearch, setPageSearch] = useState("");

  const pages = [
    { path: "/", label: "/" },
    { path: "/dashboard", label: "/dashboard" },
    { path: "/settings", label: "/settings" },
  ];

  const filteredPages = pages.filter((p) =>
    p.label.toLowerCase().includes(pageSearch.toLowerCase())
  );

  return (
    <header className="h-12 shrink-0 bg-black border-b border-white/[0.06] px-4 flex items-center z-30 relative">
      {/* Left: sidebar toggle + preview/code switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        <SidebarTrigger className="text-zinc-400 hover:text-white -ml-1" />

        <div className="flex p-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          {(["preview", "code"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveTab(v)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize flex items-center gap-1.5 transition-all ${activeTab === v ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
            >
              {v === "preview" ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
              )}
              {v === "preview" ? "Preview" : "Code"}
            </button>
          ))}
        </div>
      </div>

      {/* Center: URL / Page navigation bar (absolutely centered) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {/* Single device cycle toggle button */}
        <button
          onClick={() => {
            if (device === "desktop") setDevice("tablet");
            else if (device === "tablet") setDevice("mobile");
            else setDevice("desktop");
          }}
          className={`p-1.5 rounded-lg transition-colors ${device === "desktop" ? "text-zinc-400 hover:text-white" : "text-white bg-white/[0.08]"}`}
          title={`Device mode: ${device} (click to switch)`}
        >
          {device === "desktop" && (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          )}
          {device === "tablet" && (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="2.5" /></svg>
          )}
          {device === "mobile" && (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" strokeWidth="2.5" /></svg>
          )}
        </button>

        {/* Refresh */}
        <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Refresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>

        {/* Page selector dark pill */}
        <div className="relative">
          <button
            onClick={() => setPageDropdownOpen(!pageDropdownOpen)}
            className="flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.14] transition-colors min-w-[180px]"
          >
            <span className="text-[12px] font-medium text-zinc-200 flex-1 text-center">{page === "/" ? "Homepage" : page}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-500 shrink-0">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Dropdown */}
          {pageDropdownOpen && (
            <>
              {/* Backdrop to close */}
              <div className="fixed inset-0 z-40" onClick={() => { setPageDropdownOpen(false); setPageSearch(""); }} />

              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-[260px] bg-[#141417] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Search input */}
                <div className="p-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 shrink-0">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={pageSearch}
                      onChange={(e) => setPageSearch(e.target.value)}
                      placeholder="Find page or enter path"
                      autoFocus
                      className="bg-transparent text-[12px] text-zinc-200 placeholder:text-zinc-500 outline-none w-full"
                    />
                  </div>
                </div>

                {/* Page list */}
                <div className="py-1 max-h-[200px] overflow-y-auto">
                  {filteredPages.map((p) => (
                    <button
                      key={p.path}
                      onClick={() => { setPage(p.path); setPageDropdownOpen(false); setPageSearch(""); }}
                      className={`w-full px-3 py-2 text-left text-[12px] flex items-center gap-2 transition-colors ${page === p.path
                        ? "text-white bg-white/[0.06]"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                    >
                      {page === p.path && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span className={page !== p.path ? "pl-[21px]" : ""}>{p.label}</span>
                    </button>
                  ))}
                  {filteredPages.length === 0 && (
                    <p className="px-3 py-2 text-[12px] text-zinc-600">No pages found</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* External link */}
        <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Open in new tab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-[10px] font-bold">Y</div>
        <button className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors">Share</button>
        <button className="px-3.5 py-1 rounded-lg bg-white text-black text-[11px] font-bold hover:bg-zinc-200 transition-colors">Publish</button>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════
   PREVIEW VIEWPORT
   ═══════════════════════════════════════════ */
function PreviewViewport({
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
          className={`bg-white text-zinc-900 overflow-hidden shadow-2xl transition-all duration-300 ${device === "mobile"
              ? "w-[375px] h-[700px] rounded-[32px] border-[6px] border-zinc-800"
              : device === "tablet"
                ? "w-[768px] h-[1024px] rounded-[24px] border-[5px] border-zinc-800"
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
        <div className="w-full h-full font-mono text-[13px] text-zinc-300 overflow-auto bg-[#0a0a0d] border border-white/[0.06] rounded-xl p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.06] text-[11px] text-zinc-500">
            <span className="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
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