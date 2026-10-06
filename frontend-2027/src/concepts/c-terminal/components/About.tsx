import { about, links, profile } from '../../../content'
import { Prompt } from './Prompt'

const linkName: Record<string, string> = {
  GitHub: 'github',
  LinkedIn: 'linkedin',
  Resume: 'resume.pdf',
  Email: 'email',
}

export function About() {
  const { education } = profile
  const facts: [string, string][] = [
    ['study', `${education.degree}`],
    ['school', `${education.school}, grad ${education.grad}`],
    ['gpa', education.gpa],
    ['location', profile.location],
  ]

  return (
    <section id="about" className="ct-section ct-about" aria-labelledby="about-h">
      <Prompt id="about-h" as="h1" command="whoami" typed cursor />

      <div className="ct-out">
        <p className="ct-name">{profile.name}</p>
        <p className="ct-bio">{profile.shortBio}</p>

        <dl className="ct-kv">
          {facts.map(([k, v]) => (
            <div key={k} className="ct-kv-row">
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Prompt command="cat about.txt" as="p" />
      <div className="ct-out ct-prose">
        {about.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className="ct-about-split">
        <div>
          <Prompt command="ps --current" as="p" />
          <ul className="ct-out ct-current">
            {profile.currently.map((c) => (
              <li key={c}>
                <span className="ct-ok" aria-hidden>
                  ●
                </span>{' '}
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Prompt command="ls links/" as="p" />
          <ul className="ct-out ct-links">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  {...(!l.href.startsWith('mailto:') ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {linkName[l.label] ?? l.label.toLowerCase()}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
