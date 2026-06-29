export default function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-3">
          <span className="text-base font-extrabold tracking-tighter text-white font-mono">
            anvilly<span className="text-zinc-500 font-normal">.</span>
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">© {new Date().getFullYear()} Anvilly Inc.</span>
        </div>

        {/* Right: Minimal Links */}
        <div className="flex items-center gap-6 text-zinc-500">
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Docs
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Community
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
