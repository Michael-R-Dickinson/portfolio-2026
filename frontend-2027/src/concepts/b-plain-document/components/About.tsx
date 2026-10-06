import { about, links, profile } from '../../../content'
import { ExtLink } from './ExtLink'

const linkLabel = (label: string) => (label === 'Resume' ? 'Resume (PDF)' : label)

export function About() {
  const { education } = profile
  return (
    <section id="about" className="b-about">
      <h1>{profile.name}</h1>
      <p className="b-lede">{profile.shortBio}</p>

      <p>
        I&rsquo;m an undergraduate at the {education.school} in {profile.location}, studying{' '}
        {education.degree.replace(' (Double Major)', '')} as a double major (GPA {education.gpa},
        graduating {education.grad}).
      </p>
      <p>{about[1]}</p>
      <p>{about[2]}</p>

      <p className="b-currently">
        <span className="b-label">Currently:</span>{' '}
        {profile.currently.map((c, i) => (
          <span key={c}>
            {i > 0 && '; '}
            {c}
          </span>
        ))}
        .
      </p>

      <p className="b-links">
        {links.map((l, i) => (
          <span key={l.label}>
            {i > 0 && ' · '}
            <ExtLink href={l.href}>{linkLabel(l.label)}</ExtLink>
          </span>
        ))}
      </p>
    </section>
  )
}
