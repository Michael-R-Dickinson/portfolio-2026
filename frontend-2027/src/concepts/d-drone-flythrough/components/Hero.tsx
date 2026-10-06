import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { links, profile } from '../../../content'

export function Hero() {
  return (
    <section className="cd-hero" id="top">
      <nav className="cd-topbar">
        <span className="cd-mono cd-callsign">
          <span className="cd-dot" /> MD-01 · UBC UAS
        </span>
        <div className="cd-topbar__links">
          <a href="#projects">Survey</a>
          <a href="#flight-log">Flight log</a>
          <a href="/resume.pdf" target="_blank" rel="noreferrer">Resume</a>
        </div>
      </nav>

      <div className="cd-hero__copy">
        <p className="cd-kicker">
          {profile.location} · 49.26°N 123.25°W
        </p>
        <h1 className="cd-hero__name">{profile.name}</h1>
        <p className="cd-hero__bio">{profile.shortBio}</p>
        <p className="cd-hero__edu">
          {profile.education.degree.replace(' (Double Major)', '')}, UBC · grad {profile.education.grad}
        </p>
        <ul className="cd-hero__now">
          {profile.currently.map((c) => (
            <li key={c}>
              <span className="cd-mono">NOW</span> {c}
            </li>
          ))}
        </ul>
        <div className="cd-hero__links">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="cd-btn"
              {...(!l.href.startsWith('mailto:') ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {l.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <a href="#projects" className="cd-hero__scroll cd-mono">
        Scroll to take off <ChevronDown size={14} aria-hidden="true" />
      </a>
    </section>
  )
}
