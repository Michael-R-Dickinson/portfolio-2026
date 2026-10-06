import { projects } from '../../../content'
import { Prompt } from './Prompt'
import { Tags } from './Tags'

export function Projects() {
  return (
    <section id="projects" className="ct-section" aria-labelledby="projects-h">
      <Prompt id="projects-h" command="ls projects/" />
      <ul className="ct-out ct-ls">
        {projects.map((p) => (
          <li key={p.id}>
            <a href={`#p-${p.id}`}>{p.id}/</a>
          </li>
        ))}
      </ul>

      <Prompt command="cat projects/*/README.md" as="p" />
      <div className="ct-out ct-projects">
        {projects.map((p) => (
          <article key={p.id} id={`p-${p.id}`} className="ct-project">
            <header className="ct-project-path">
              <span>projects/{p.id}/README.md</span>
              <span className="ct-kind">{p.kind}</span>
            </header>
            <h3 className="ct-project-title">
              <span className="ct-hash" aria-hidden>
                #{' '}
              </span>
              {p.title}
            </h3>
            <p className="ct-project-sub">{p.subtitle}</p>
            <p className="ct-project-desc">{p.description}</p>
            <ul className="ct-highlights">
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <div className="ct-project-foot">
              <Tags tags={p.tags} />
              {p.href && (
                <a className="ct-src" href={p.href} target="_blank" rel="noreferrer">
                  → source
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
