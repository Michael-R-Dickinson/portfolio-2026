import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, type Ref } from 'react'
import { projects, type Project } from '../../../content'

const FEATURED = new Set(['livenexus', 'uas'])
const pad = (n: number, w = 4) => String(n).padStart(w, '0')

// Decorative capture metadata (a nod to the aerial image stream), deterministic per frame.
function meta(i: number) {
  const lat = (49.2606 + i * 0.0013).toFixed(4)
  const lon = (123.246 - i * 0.0021).toFixed(4)
  return { gps: `${lat}°N ${lon}°W`, alt: 118 + ((i * 7) % 12), t: `00:${pad(12 + i * 3, 2)}:${pad((i * 17) % 60, 2)}` }
}

function Frame({ p, i }: { p: Project; i: number }) {
  const m = meta(i)
  const featured = FEATURED.has(p.id)
  return (
    <article className={`cd-frame ${featured ? 'is-featured' : ''}`} data-frame>
      <span className="cd-frame__corner tl" />
      <span className="cd-frame__corner tr" />
      <span className="cd-frame__corner bl" />
      <span className="cd-frame__corner br" />
      <span className="cd-frame__flash" />

      <header className="cd-frame__meta">
        <span>
          <span className="cd-rec" /> FRM {pad(i + 1)}/{pad(projects.length)}
        </span>
        <span className="cd-frame__gps">{m.gps}</span>
      </header>

      <div className="cd-frame__body">
        <p className="cd-frame__kind">{p.kind}</p>
        <h3 className="cd-frame__title">
          {p.href ? (
            <a href={p.href} target="_blank" rel="noreferrer">
              {p.title} <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ) : (
            p.title
          )}
        </h3>
        <p className="cd-frame__sub">{p.subtitle}</p>
        <p className="cd-frame__desc">{p.description}</p>
        {featured && (
          <ul className="cd-frame__hl">
            {p.highlights.slice(0, 2).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        <ul className="cd-tags">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>

      <footer className="cd-frame__meta cd-frame__meta--bottom">
        <span>T+{m.t}</span>
        <span>ALT {m.alt}m · NADIR</span>
      </footer>
    </article>
  )
}

export function Projects({ ref }: { ref?: Ref<HTMLElement> }) {
  const gridRef = useRef<HTMLDivElement>(null)

  // "Capture" each frame (shutter flash + brackets snap in) the first time it enters view.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-captured')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.25 },
    )
    grid.querySelectorAll('[data-frame]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section className="cd-section cd-projects" id="projects" ref={ref}>
      <header className="cd-section__head">
        <p className="cd-kicker">02 · Aerial survey · {projects.length} frames captured</p>
        <h2>Projects</h2>
      </header>
      <div className="cd-frames" ref={gridRef}>
        {projects.map((p, i) => (
          <Frame key={p.id} p={p} i={i} />
        ))}
      </div>
    </section>
  )
}
