import { projects } from '../../../content'
import { ExtLink } from './ExtLink'

export function Projects() {
  return (
    <section id="projects">
      <h2>Projects</h2>
      <ol className="b-projects">
        {projects.map((p) => (
          <li key={p.id}>
            <strong className="b-title">
              {p.href ? <ExtLink href={p.href}>{p.title}</ExtLink> : p.title}
            </strong>
            . <em>{p.subtitle}.</em> {p.description}{' '}
            <span className="b-tags">&mdash; {p.tags.join(', ')}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
