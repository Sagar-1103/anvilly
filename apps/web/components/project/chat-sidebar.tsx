"use client";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useEffect, useRef, useState } from "react";

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

export default function ChatSidebar() {
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
    <Sidebar collapsible="icon" className="border-r border-white/6">
      {/* Sidebar Top Header — project name */}
      <SidebarHeader className="h-12 px-4 flex flex-row items-center gap-3 border-b border-white/6 shrink-0 bg-black">
        <Link href="/" className="shrink-0">
          <span className="text-[15px] font-extrabold tracking-tighter font-mono text-white">
            anvilly<span className="text-zinc-600 font-normal">.</span>
          </span>
        </Link>
        <span className="h-4 w-px bg-white/8" />
        <button className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-300 hover:text-white transition-colors truncate">
          Your Daily Tasks
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-600 shrink-0">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </SidebarHeader>

      {/* Chat Messages */}
      <SidebarContent className="p-0! flex-1 overflow-hidden">
        <div ref={feedRef} className="h-full overflow-y-auto px-4 pt-4 pb-6 space-y-4 text-[13px] leading-[1.6]">
          {msgs.map((m) => (
            <div key={m.id}>
              {m.ts && <p className="text-center text-[11px] text-zinc-600 font-mono mb-3">{m.ts}</p>}

              {m.role === "user" && (
                <div className="flex justify-end">
                  <div className="bg-white/[0.07] border border-white/6 text-zinc-200 px-4 py-2 rounded-2xl rounded-br-md max-w-[85%] text-[13px]">
                    {m.body}
                  </div>
                </div>
              )}

              {m.role === "assistant" && (
                <div className="space-y-3 text-[13px]">
                  {m.thinking && (
                    <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 bg-white/3 border border-white/6 px-2 py-0.5 rounded-md">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {m.thinking}
                    </div>
                  )}

                  {m.body && <p className="text-zinc-400">{m.body}</p>}

                  {m.card && (
                    <div className="bg-white/3 border border-white/6 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-[13px]">{m.card.title}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-600"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {m.card.tabs.map((t) => (
                          <button key={t} className="py-1.5 rounded-lg bg-white/4 border border-white/6 text-zinc-400 text-[11px] font-medium hover:text-white hover:bg-white/[0.07] transition-colors">{t}</button>
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
      <SidebarFooter className="p-0! border-t border-white/6 bg-black">
        {/* Prompt box */}
        <div className="p-3">
          <form onSubmit={send} className="bg-white/3 border border-white/6 rounded-xl p-3 flex flex-col min-h-24 focus-within:border-white/12 transition-colors">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask Anvilly..."
              rows={2}
              className="flex-1 bg-transparent text-[13px] text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/4">
              <button type="button" className="w-6 h-6 rounded-md bg-white/4 border border-white/6 text-zinc-500 hover:text-white flex items-center justify-center transition-colors">
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