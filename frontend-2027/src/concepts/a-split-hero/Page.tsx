import './styles.css'
import { links, profile } from '../../content'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { Timeline } from './components/Timeline'

export default function Page() {
  return (
    <div className="concept-a">
      <Hero />
      <main className="a-container">
        <Projects />
        <Timeline />
      </main>
      <footer className="a-container a-footer">
        <span>© 2026 {profile.name}</span>
        <nav aria-label="Contact">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(!l.href.startsWith('mailto:') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  )
}
