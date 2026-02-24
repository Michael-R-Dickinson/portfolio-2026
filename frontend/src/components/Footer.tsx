export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-surface-dark mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-500 text-sm">Michael Dickinson</p>
        <div className="flex gap-6">
          <a
            href="https://github.com/Michael-R-Dickinson"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-primary text-sm font-medium"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/michael-r-dickinson/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-primary text-sm font-medium"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
