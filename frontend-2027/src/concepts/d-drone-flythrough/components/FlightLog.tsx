import type { Ref } from 'react'
import { timeline } from '../../../content'

const STATUS = { past: 'Flown', current: 'In flight', future: 'Planned' } as const

export function FlightLog({ ref, active }: { ref?: Ref<HTMLElement>; active: number }) {
  return (
    <section className="cd-section cd-log" id="flight-log" ref={ref}>
      <header className="cd-section__head">
        <p className="cd-kicker">03 · Flight log · past → future</p>
        <h2>Experience</h2>
        <p className="cd-legend cd-mono">
          <span className="cd-legend__flown" /> flown
          <span className="cd-legend__planned" /> planned
        </p>
      </header>

      <ol className="cd-wps">
        {timeline.map((e, i) => (
          <li
            key={e.id}
            data-wp={i}
            className={`cd-wp is-${e.status} ${i === active ? 'is-active' : ''}`}
          >
            <div className="cd-wp__head cd-mono">
              <span className="cd-wp__num">WP{String(i + 1).padStart(2, '0')}</span>
              <span>{e.date}</span>
              <span className="cd-wp__status">{STATUS[e.status]}</span>
            </div>
            <h3 className="cd-wp__title">{e.title}</h3>
            <p className="cd-wp__org">{e.org}</p>
            <p className="cd-wp__desc">{e.description}</p>
            {e.tags.length > 0 && (
              <ul className="cd-tags">
                {e.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
