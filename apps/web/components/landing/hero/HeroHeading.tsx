"use client";

export default function HeroHeading() {
  return (
    <>
      {/* Background Grid & Light Spotlight */}
      <div className="absolute inset-0 hero-grid pointer-events-none opacity-50" />
      <div className="absolute inset-0 hero-radial pointer-events-none" />

      {/* Heading */}
      <h1 className="relative z-10 text-center max-w-3xl animate-fade-in-up stagger-1">
        <span className="block text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
          Forge software from pure thought.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 mt-6 text-center max-w-lg text-zinc-400 text-base sm:text-lg leading-relaxed animate-fade-in-up stagger-2">
        Anvilly shapes your prompts into production-ready web and mobile applications in seconds.
      </p>
    </>
  );
}
