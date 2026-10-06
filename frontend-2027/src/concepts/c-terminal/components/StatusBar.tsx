import { useEffect, useState } from 'react'
import { profile } from '../../../content'

const tabs = [
  { id: 'about', label: 'whoami' },
  { id: 'projects', label: 'projects' },
  { id: 'timeline', label: 'git-log' },
]

// tmux-style status line; doubles as section nav.
export function StatusBar() {
  const [active, setActive] = useState('about')

  useEffect(() => {
    const els = tabs.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <nav className="ct-status" aria-label="Sections">
      <span className="ct-status-session">[mdickinson]</span>
      <ul>
        {tabs.map((t, i) => (
          <li key={t.id}>
            <a href={`#${t.id}`} className={active === t.id ? 'is-active' : undefined}>
              {i}:{t.label}
              {active === t.id ? '*' : ''}
            </a>
          </li>
        ))}
      </ul>
      <span className="ct-status-right">{profile.location}</span>
    </nav>
  )
}
