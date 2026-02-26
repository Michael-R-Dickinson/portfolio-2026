import { navLinks } from '../data'

export function Nav() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-12 glass-panel rounded-full px-8 py-3 border border-white/10">
        {navLinks.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className={`text-sm font-medium text-slate-400 hover:text-primary transition-colors${
              href === '#roadmap' ? ' hidden md:inline' : ''
            }`}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}
