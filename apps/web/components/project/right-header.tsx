"use client";

import { useEffect, useRef, useState } from "react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import { signOut, useSession } from "next-auth/react";
import { Project } from "@/lib/types";

export default function RightHeader({
  device,
  setDevice,
  activeTab,
  setActiveTab,
  reloadProjectLink,
  project,
}: {
  device: "desktop" | "tablet" | "mobile";
  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
  activeTab: "preview" | "code";
  setActiveTab: (t: "preview" | "code") => void;
  reloadProjectLink: () => void;
  project: Project;
}) {
  const { toggleSidebar, state } = useSidebar();
  const [page, setPage] = useState("/");
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [pageSearch, setPageSearch] = useState("");
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userImage = session?.user?.image;
  const userEmail = session?.user?.email;
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "?";

  const pages = [
    { path: "/", label: "/" },
    { path: "/dashboard", label: "/dashboard" },
    { path: "/settings", label: "/settings" },
  ];

  const filteredPages = pages.filter((p) =>
    p.label.toLowerCase().includes(pageSearch.toLowerCase())
  );

  const openProjectUrl = () => {
    if (!project.url) return;
    window.open(project.url,"_blank");
  }

  return (
    <header className="h-12 shrink-0 bg-black border-b border-white/6 px-4 flex items-center z-30 relative">
      {/* Left: sidebar toggle + preview/code switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        <SidebarTrigger className="text-zinc-400 cursor-pointer hover:text-white -ml-1" />

        <div className="flex p-0.5 rounded-lg bg-white/4 border border-white/6">
          {(["preview", "code"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveTab(v)}
              className={`px-2.5 cursor-pointer py-1 rounded-md text-[11px] font-semibold capitalize flex items-center gap-1.5 transition-all ${activeTab === v ? "bg-white/8 text-white" : "text-zinc-500 hover:text-zinc-300"
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
          className={`p-1.5 cursor-pointer rounded-lg transition-colors ${device === "desktop" ? "text-zinc-400 hover:text-white" : "text-white bg-white/8"}`}
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
        <button onClick={reloadProjectLink} className="p-1.5 cursor-pointer rounded-lg text-zinc-400 hover:text-white transition-colors" title="Refresh">
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
            className="flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-full bg-white/6 border border-white/8 hover:border-white/[0.14] transition-colors min-w-45"
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

              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-65 bg-[#141417] border border-white/8 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Search input */}
                <div className="p-2 border-b border-white/6">
                  <div className="flex items-center gap-2 bg-white/4 border border-white/6 rounded-lg px-3 py-2">
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
                <div className="py-1 max-h-50 overflow-y-auto">
                  {filteredPages.map((p) => (
                    <button
                      key={p.path}
                      onClick={() => { setPage(p.path); setPageDropdownOpen(false); setPageSearch(""); }}
                      className={`w-full px-3 py-2 text-left text-[12px] flex items-center gap-2 transition-colors ${page === p.path
                        ? "text-white bg-white/6"
                        : "text-zinc-400 hover:text-white hover:bg-white/4"
                        }`}
                    >
                      {page === p.path && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      <span className={page !== p.path ? "pl-5.25" : ""}>{p.label}</span>
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
        <button onClick={openProjectUrl} className="p-1.5 cursor-pointer rounded-lg text-zinc-400 hover:text-white transition-colors" title="Open in new tab">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 ml-auto">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="relative w-6 h-6 rounded-full overflow-hidden border border-white/8 flex items-center justify-center text-[10px] font-bold cursor-pointer hover:border-white/30 focus:outline-none transition-colors"
          >
            {userImage ? (
              <img
                src={userImage}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-violet-600 to-indigo-700 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold leading-none">
                  {initial}
                </span>
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-zinc-950 border border-zinc-800/80 shadow-2xl shadow-black/60 overflow-hidden animate-fade-in-up">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-zinc-800/60 text-left">
                <p className="text-xs font-semibold text-white truncate">
                  {userEmail}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Signed in
                </p>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer flex items-center gap-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
        <button className="px-3 py-1 cursor-pointer rounded-lg bg-white/4 border border-white/6 text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors">Share</button>
        <button className="px-3.5 py-1 cursor-pointer rounded-lg bg-white text-black text-[11px] font-bold hover:bg-zinc-200 transition-colors">Publish</button>
      </div>
    </header>
  );
}
