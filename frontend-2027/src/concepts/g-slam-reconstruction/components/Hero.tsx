import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { links, profile } from '../../../content'

export function Hero() {
  return (
    <section className="g-hero relative flex min-h-svh items-end md:items-center" aria-label="About">
      <div className="g-hero-scrim pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1280px] px-5 pb-10 pt-28 md:px-10 md:pb-16">
        <div className="max-w-[560px]">
          <p className="g-mono g-eyebrow mb-5 flex items-center gap-2">
            <span className="g-rec" aria-hidden />
            live reconstruction · {profile.location}
          </p>
          <h1 className="g-name">{profile.name}</h1>
          <p className="g-bio mt-5">{profile.shortBio}</p>
          <p className="g-sub mt-4">
            {profile.education.degree}, {profile.education.school}. Graduating {profile.education.grad}.
          </p>
          <ul className="g-mono g-currently mt-5 space-y-1.5">
            {profile.currently.map((c) => (
              <li key={c} className="flex items-baseline gap-2">
                <span className="g-tick" aria-hidden>
                  ▸
                </span>
                {c}
              </li>
            ))}
          </ul>
          <nav className="mt-8 flex flex-wrap gap-2.5" aria-label="Links">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="g-btn"
                {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {l.label}
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="g-mono g-scrollcue absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 md:flex" aria-hidden>
        <ArrowDown size={13} /> scroll to densify the map
      </div>
    </section>
  )
}
