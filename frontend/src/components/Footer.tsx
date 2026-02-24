export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-surface-dark mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">© 2024 Alex Chen. MIT License.</p>
        <div className="flex gap-6">
          <a href="#" className="text-slate-500 hover:text-primary text-sm font-medium">
            GitHub
          </a>
          <a href="#" className="text-slate-500 hover:text-primary text-sm font-medium">
            LinkedIn
          </a>
          <a href="#" className="text-slate-500 hover:text-primary text-sm font-medium">
            Twitter
          </a>
        </div>
        <div className="text-xs text-slate-600 font-mono">
          System: Online <span className="text-green-500">●</span>
        </div>
      </div>
    </footer>
  )
}
