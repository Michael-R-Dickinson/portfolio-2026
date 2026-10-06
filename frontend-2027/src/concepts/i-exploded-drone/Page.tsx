import './styles.css'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { DronePartId } from '../../shared/drone'
import { Hero } from './components/Hero'
import { Revisions } from './components/Revisions'
import { Teardown } from './components/Teardown'
import { useReducedMotion } from './hooks/useReducedMotion'
import { CALLOUTS, MINOR_LABELS, STACKED_QUERY, clamp01, rig } from './state'

const Scene = lazy(() => import('./components/Scene').then((m) => ({ default: m.Scene })))

export default function Page() {
  const reduced = useReducedMotion()
  const sheetRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const teardownRef = useRef<HTMLElement>(null)
  const [scrollFocus, setScrollFocus] = useState<DronePartId | null>(null)
  const [hover, setHover] = useState<DronePartId | null>(null)
  const [active, setActive] = useState(true)
  const focus = hover ?? scrollFocus

  // Scroll → explode amount (mutable store, read per frame) + which part is in focus (coarse React state).
  useEffect(() => {
    let raf = 0
    const mq = window.matchMedia(STACKED_QUERY)
    const update = () => {
      raf = 0
      const sec = teardownRef.current
      const sheet = sheetRef.current
      const stage = stageRef.current
      if (!sec || !sheet || !stage) return
      const vh = window.innerHeight
      const r = sec.getBoundingClientRect()
      let next: DronePartId | null = null
      if (mq.matches) {
        // stacked: drone pinned on top, cards scroll under it; focus = card crossing a line below the stage
        const stageH = stage.offsetHeight
        rig.explode = clamp01((vh - r.top) / (vh * 0.42))
        const line = stageH + (vh - stageH) * 0.4
        for (const c of CALLOUTS) {
          const b = sec.querySelector(`[data-card="${c.part}"]`)?.getBoundingClientRect()
          if (b && b.top <= line) next = c.part
        }
      } else {
        // desktop: explode while the diagram panel scrolls in, then step through the parts while it is pinned
        rig.explode = clamp01((vh * 0.92 - r.top) / (vh * 0.72))
        const pin = Math.max(1, r.height - vh)
        const q = (vh * 0.3 - r.top) / (vh * 0.3 + pin)
        if (q >= 0) next = CALLOUTS[Math.min(CALLOUTS.length - 1, Math.floor(q * CALLOUTS.length))].part
      }
      setScrollFocus(next)
      setActive(sheet.getBoundingClientRect().bottom > 0)
      rig.invalidate?.()
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      rig.explode = 0
    }
  }, [])

  return (
    <div className="concept-i" data-focus={focus ?? 'none'}>
      <div className="ci-sheet" ref={sheetRef}>
        <div className="ci-stage" ref={stageRef} aria-hidden="true">
          <Suspense fallback={null}>
            <Scene reduced={reduced} focus={focus} stageRef={stageRef} active={active} />
          </Suspense>
          <svg className="ci-leaders" width="100%" height="100%">
            {CALLOUTS.map((c) => (
              <g key={c.part} data-on={focus === c.part}>
                <path data-lead={c.part} />
                <g data-pt={c.part} transform="translate(-99 -99)">
                  <circle className="ci-pt-ring" r="11" />
                  <circle className="ci-pt-dot" r="3" />
                  <text className="ci-pt-no" dy="3.5">
                    {c.no}
                  </text>
                </g>
              </g>
            ))}
          </svg>
          <div className="ci-minor">
            {MINOR_LABELS.map((m) => (
              <span key={m.part} data-minor={m.part} data-side={m.side}>
                {m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="ci-flow">
          <Hero />
          <Teardown ref={teardownRef} focus={focus} onHover={setHover} />
        </div>
      </div>
      <Revisions />
    </div>
  )
}
