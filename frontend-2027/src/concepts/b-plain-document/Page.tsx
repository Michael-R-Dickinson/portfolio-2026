import './styles.css'
import { profile } from '../../content'
import { About } from './components/About'
import { Projects } from './components/Projects'
import { Timeline } from './components/Timeline'

export default function Page() {
  return (
    <div className="concept-b">
      <div className="b-page">
        <nav className="b-nav" aria-label="Sections">
          <a href="#about">About</a> · <a href="#projects">Projects</a> ·{' '}
          <a href="#timeline">Timeline</a>
        </nav>
        <main>
          <About />
          <Projects />
          <Timeline />
        </main>
        <footer className="b-footer">
          <hr />
          <p>
            {profile.name} · {profile.location} ·{' '}
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
          <p>Last updated October 2026.</p>
        </footer>
      </div>
    </div>
  )
}
