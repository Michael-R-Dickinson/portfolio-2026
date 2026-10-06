import { ArrowUpRight } from 'lucide-react'
import { projects } from '../../../content'
import { dom } from '../state'

// Each project is styled as a SLAM "submap" debug panel. The submap ids and integration bars
// are decorative viewer chrome, not claims about the projects.
export function Projects() {
  return (
    <section className="g-projects relative px-5 py-16 md:px-10" aria-labelledby="g-projects-h">
      <div className="mx-auto max-w-[1280px]">
        <div className="g-col">
          <header className="mb-8">
            <p className="g-mono g-eyebrow">02 · submaps</p>
            <h2 id="g-projects-h" className="g-h2 mt-2">
              Projects
            </h2>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p, i) => (
              <article key={p.id} className={`g-panel ${i === 0 ? 'md:col-span-2' : ''}`}>
                <span className="g-corner tl" aria-hidden />
                <span className="g-corner br" aria-hidden />
                <div className="g-mono g-panel-head" aria-hidden>
                  <span>
                    SUBMAP {String(i + 1).padStart(2, '0')} · {p.kind}
                  </span>
                  <span className="g-bar">
                    <span
                      className="g-bar-fill"
                      ref={(el) => {
                        dom.bars[i] = el
                      }}
                    />
                  </span>
                </div>
                <h3 className="g-h3">
                  {p.href ? (
                    <a href={p.href} target="_blank" rel="noreferrer" className="g-title-link">
                      {p.title}
                      <ArrowUpRight size={16} aria-hidden />
                    </a>
                  ) : (
                    p.title
                  )}
                </h3>
                <p className="g-panel-sub">{p.subtitle}</p>
                <p className="g-panel-body mt-3">{p.description}</p>
                {i === 0 && (
                  <ul className="g-obs mt-3 md:columns-2 md:gap-6">
                    {p.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
                <ul className="mt-3.5 flex flex-wrap gap-1.5" aria-label="Tags">
                  {p.tags.map((t) => (
                    <li key={t} className="g-tag g-mono">
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
