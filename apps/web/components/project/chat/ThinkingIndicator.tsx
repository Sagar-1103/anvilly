"use client";

export default function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 text-zinc-400 text-[12px] font-mono py-2 bg-zinc-950/40 px-3 rounded-xl border border-white/5 w-fit">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      Anvilly is thinking...
    </div>
  );
}
