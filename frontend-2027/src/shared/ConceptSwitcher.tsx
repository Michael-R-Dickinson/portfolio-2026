import { Link, useLocation } from 'wouter'
import { concepts } from '../concepts/registry'

// Dev-only floating switcher. Hidden with ?bare (e.g. for screenshots).
export function ConceptSwitcher() {
  const [location] = useLocation()
  if (new URLSearchParams(window.location.search).has('bare')) return null

  return (
    <nav className="fixed bottom-3 left-3 z-[9999] flex gap-1 rounded-full bg-black/70 p-1 font-mono text-xs text-white opacity-40 backdrop-blur transition-opacity hover:opacity-100">
      <Link href="/" className="rounded-full px-2 py-1 hover:bg-white/20">
        ~
      </Link>
      {concepts.map((c) => (
        <Link
          key={c.letter}
          href={`/${c.letter}`}
          title={c.name}
          className={`rounded-full px-2 py-1 uppercase hover:bg-white/20 ${location === `/${c.letter}` ? 'bg-white text-black' : ''}`}
        >
          {c.letter}
        </Link>
      ))}
    </nav>
  )
}
