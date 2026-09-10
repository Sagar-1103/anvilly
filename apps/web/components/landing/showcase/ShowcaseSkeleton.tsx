"use client";

export default function ShowcaseSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-64 rounded-2xl bg-zinc-950/60 border border-zinc-900 animate-pulse p-4 flex flex-col justify-between"
        >
          <div className="h-32 bg-zinc-900/60 rounded-xl" />
          <div className="space-y-2 mt-4">
            <div className="h-4 bg-zinc-900 rounded w-2/3" />
            <div className="h-3 bg-zinc-900/60 rounded w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
