import { projects, type Project } from '../../../content'

const PICKS = ['livenexus', 'uas', 'bert-vit', 'gcom']
const KIND_LABEL: Record<Project['kind'], string> = {
  research: 'Research',
  autonomy: 'Autonomy',
  web: 'Software',
}

const picked = PICKS.map((id) => projects.find((p) => p.id === id)).filter(
  (p): p is Project => p !== undefined,
)

export function Projects() {
  return (
    <section className="a-section" aria-labelledby="a-work">
      <div className="a-section__head">
        <span className="a-section__num">01</span>
        <h2 id="a-work">Selected work</h2>
      </div>

      <div className="a-grid">
        {picked.map((p, i) => (
          <article key={p.id} className="a-card">
            <p className="a-card__kicker">
              <span>{String(i + 1).padStart(2, '0')}</span>
              {KIND_LABEL[p.kind]}
            </p>
            <h3 className="a-card__title">
              {p.href ? (
                <a href={p.href} target="_blank" rel="noreferrer">
                  {p.title}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ) : (
                p.title
              )}
            </h3>
            <p className="a-card__sub">{p.subtitle}</p>
            <p className="a-card__desc">{p.description}</p>
            <ul className="a-card__hl">
              {p.highlights.slice(0, 2).map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <ul className="a-tags" aria-label="Stack">
              {p.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
