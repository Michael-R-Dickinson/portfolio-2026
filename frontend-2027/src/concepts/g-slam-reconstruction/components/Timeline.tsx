import type { RefObject } from 'react'
import { profile, timeline } from '../../../content'
import { kfId } from '../state'

/** Small frustum glyph for the rail: solid for tracked poses, hollow + dashed for predicted ones. */
function FrustumIcon({ future, active }: { future: boolean; active: boolean }) {
  return (
    <svg viewBox="0 0 24 20" className={`g-ficon ${active ? 'is-active' : ''}`} aria-hidden>
      <path
        d="M3 4 L21 4 L21 16 L3 16 Z M3 4 L12 10 L21 4 M3 16 L12 10 L21 16"
        fill={future ? 'none' : 'currentColor'}
        fillOpacity={future ? 0 : 0.18}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray={future ? '2.2 1.8' : undefined}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Timeline({
  active,
  itemRefs,
  sectionRef,
}: {
  active: number
  itemRefs: RefObject<(HTMLElement | null)[]>
  sectionRef: RefObject<HTMLElement | null>
}) {
  return (
    <section ref={sectionRef} className="g-timeline relative px-5 pb-16 pt-16 md:px-10" aria-labelledby="g-tl-h">
      <div className="mx-auto max-w-[1280px]">
        <div className="g-col g-tl-col">
          <header className="mb-4">
            <p className="g-mono g-eyebrow">03 · trajectory</p>
            <h2 id="g-tl-h" className="g-h2 mt-2">
              Timeline
            </h2>
            <p className="g-sub mt-2 max-w-[44ch]">
              Each role is a keyframe on the camera path. Dashed poses are predicted: not visited yet.
            </p>
          </header>
          <ol className="g-rail">
            {timeline.map((e, i) => {
              const future = e.status === 'future'
              const isActive = i === active
              return (
                <li
                  key={e.id}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  className={`g-kf ${future ? 'is-future' : ''} ${e.status === 'current' ? 'is-current' : ''} ${isActive ? 'is-active' : ''}`}
                >
                  <div className="g-kf-marker">
                    <FrustumIcon future={future} active={isActive} />
                  </div>
                  <div className="g-kf-body">
                    <div className="g-kf-top">
                      <p className="g-mono g-kf-meta">
                        <span>{kfId(i)}</span>
                        <span aria-hidden>·</span>
                        <span>{e.date}</span>
                        {future && <span className="g-kf-flag">predicted</span>}
                        {e.status === 'current' && <span className="g-kf-flag is-live">tracking</span>}
                      </p>
                      {e.tags.length > 0 && (
                        <ul className="g-kf-tags flex flex-wrap gap-1" aria-label="Tags">
                          {e.tags.map((t) => (
                            <li key={t} className="g-tag g-tag-sm g-mono">
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <h3 className="g-kf-title">
                      {e.title} <span className="g-kf-org">· {e.org}</span>
                    </h3>
                    <p className="g-kf-desc">{e.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
          <footer className="g-mono g-foot mt-10">
            <span>{profile.name}</span>
            <span aria-hidden>·</span>
            <span>procedural point cloud stand-in; a real Gaussian-splat capture goes here next</span>
          </footer>
        </div>
      </div>
    </section>
  )
}
