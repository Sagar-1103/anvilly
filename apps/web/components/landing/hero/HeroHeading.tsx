"use client";

export default function HeroHeading() {
  return (
    <>
      {/* Subtle Title Ultraviolet Aura */}
      <div
        aria-hidden="true"
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none select-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.05) 45%, transparent 70%)",
        }}
      />


      {/* Heading */}
      <h1 className="relative z-10 text-center max-w-4xl px-4 animate-fade-in-up stagger-1 font-heading">
        <span className="block text-4xl sm:text-5xl lg:text-[58px] font-semibold tracking-tight text-white leading-[1.15]">
          Forge software from{" "}
          <span className="whitespace-nowrap bg-gradient-to-r from-violet-200 via-white to-purple-300 bg-clip-text text-transparent">
            pure thought.
          </span>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 mt-5 text-center max-w-xl text-zinc-200 text-base sm:text-lg leading-relaxed animate-fade-in-up stagger-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
        Anvilly shapes your prompts into production-ready web and mobile applications in seconds.
      </p>
    </>
  );
}
