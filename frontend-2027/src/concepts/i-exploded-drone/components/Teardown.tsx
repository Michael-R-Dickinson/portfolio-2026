import type { Ref } from 'react'
import type { DronePartId } from '../../../shared/drone'
import { BOM, CALLOUTS, type Callout } from '../state'

type Props = {
  ref: Ref<HTMLElement>
  focus: DronePartId | null
  onHover: (part: DronePartId | null) => void
}

function Card({ c, focus, onHover }: { c: Callout } & Omit<Props, 'ref'>) {
  const state = focus === null ? 'idle' : focus === c.part ? 'on' : 'off'
  return (
    <article
      className="ci-card"
      data-card={c.part}
      data-state={state}
      onMouseEnter={() => onHover(c.part)}
      onMouseLeave={() => onHover(null)}
    >
      <header>
        <span className="ci-no">{c.no}</span>
        <div>
          <p className="ci-part">{c.partName}</p>
          <h3>{c.title}</h3>
          <p className="ci-source">{c.source}</p>
        </div>
      </header>
      <div className="ci-card-more">
        <div>
          {c.body.length === 1 ? (
            <p className="ci-card-text">{c.body[0]}</p>
          ) : c.part === 'compute' ? (
            <>
              <p className="ci-card-text">{c.body[0]}</p>
              <ul>
                {c.body.slice(1).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </>
          ) : (
            <ul>
              {c.body.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          <ul className="ci-tags">
            {c.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  )
}

export function Teardown({ ref, focus, onHover }: Props) {
  const step = focus ? CALLOUTS.findIndex((c) => c.part === focus) + 1 : 0
  return (
    <section className="ci-teardown" id="teardown" ref={ref} aria-labelledby="ci-teardown-h">
      <div className="ci-panel">
        <div className="ci-panel-head">
          <h2 id="ci-teardown-h">
            <span>Fig. 1</span> Exploded view: projects
          </h2>
          <p className="ci-steps" aria-hidden="true">
            {CALLOUTS.map((c, i) => (
              <i key={c.part} data-on={step === i + 1} />
            ))}
            <span>
              {String(step).padStart(2, '0')}/{String(CALLOUTS.length).padStart(2, '0')}
            </span>
          </p>
        </div>

        {(['left', 'right'] as const).map((side) => (
          <div key={side} className={`ci-col ci-col-${side}`}>
            {CALLOUTS.filter((c) => c.side === side).map((c) => (
              <Card key={c.part} c={c} focus={focus} onHover={onHover} />
            ))}
          </div>
        ))}

        <div className="ci-bom">
          <p className="ci-bom-title">
            <span>Bill of materials</span> other builds, not on the airframe
          </p>
          <ul>
            {BOM.map((p, i) => (
              <li key={p.id}>
                <span className="ci-bom-item">{String.fromCharCode(65 + i)}</span>
                <span className="ci-bom-name">
                  {p.href ? (
                    <a href={p.href} target="_blank" rel="noreferrer">
                      {p.title}
                    </a>
                  ) : (
                    p.title
                  )}
                </span>
                <span className="ci-bom-desc">{p.subtitle}</span>
                <span className="ci-bom-tags">{p.tags.join(' · ')}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
