// Concept G: SLAM reconstruction.
// A fixed WebGL viewer sits behind three DOM sections. Scrolling densifies a sparse keypoint
// map into a splat reconstruction (About → Projects), then the camera rides the capture
// trajectory whose keyframes are timeline entries (Timeline).
import { useEffect, useRef, useState } from 'react'
import { timeline } from '../../content'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { Timeline } from './components/Timeline'
import { Viewer } from './components/Viewer'
import { useReducedMotion } from './hooks/useReducedMotion'
import { clamp01, dom, kfId, slam } from './state'
import './styles.css'

const N = timeline.length

function pickBudget() {
  if (typeof window === 'undefined') return 60000
  const small = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
  return small ? 45000 : 120000
}

export default function Page() {
  const reduced = useReducedMotion()
  const [budget] = useState(pickBudget)
  const [active, setActive] = useState(0)
  const projRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const y = window.scrollY
      const proj = projRef.current
      const tl = tlRef.current
      if (!proj || !tl) return
      // densify across the hero + projects; fully converged as the projects section ends
      const end = proj.offsetTop + proj.offsetHeight - vh * 0.9
      slam.recon = reduced ? 1 : clamp01(y / Math.max(1, end))
      const r = tl.getBoundingClientRect()
      slam.tlBlend = clamp01((vh * 0.8 - r.top) / (vh * 0.55))
      // a reading line that sweeps down the viewport as the section scrolls, so the first and
      // last keyframes can both become active without extra padding
      const start = tl.offsetTop - vh * 0.2
      const stop = tl.offsetTop + tl.offsetHeight - vh
      const p = clamp01((y - start) / Math.max(1, stop - start))
      const line = vh * (0.32 + 0.5 * p)
      const centers = itemRefs.current.map((el) => {
        if (!el) return 0
        const b = el.getBoundingClientRect()
        return b.top + Math.min(b.height, 80) / 2
      })
      let f = 0
      if (line <= centers[0]) f = 0
      else if (line >= centers[N - 1]) f = N - 1
      else
        for (let i = 0; i < N - 1; i++)
          if (line >= centers[i] && line < centers[i + 1]) {
            f = i + (line - centers[i]) / Math.max(1, centers[i + 1] - centers[i])
            break
          }
      slam.tlIndex = f
      setActive(Math.round(f))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reduced])

  return (
    <div className={`concept-g ${reduced ? 'is-reduced' : ''}`}>
      <div className="g-stage" aria-hidden>
        <Viewer reduced={reduced} budget={budget} />
        <div className="g-labels">
          {timeline.map((e, i) => (
            <span
              key={e.id}
              ref={(el) => {
                dom.labels[i] = el
              }}
              className={`g-label g-mono ${e.status === 'future' ? 'is-future' : ''} ${i === active ? 'is-active' : ''}`}
            >
              {kfId(i)} · {e.year}
            </span>
          ))}
        </div>
        <div className="g-vignette" />
        <div className="g-scrim" />
      </div>

      {/* decorative viewer readout */}
      <div className="g-hud g-mono" aria-hidden>
        <span className="g-hud-brand">
          <span className="g-rec" /> MD / slam-viewer
        </span>
        <span className="g-hud-stats">
          <span className="hidden sm:inline">
            frame <b ref={(el) => void (dom.frame = el)}>01200</b>
          </span>
          <span className="hidden sm:inline">
            kf <b ref={(el) => void (dom.kf = el)}>1/8</b>
          </span>
          <span>
            map <b ref={(el) => void (dom.points = el)}>0</b>
          </span>
          <span className="g-hud-state" ref={(el) => void (dom.state = el)}>
            SPARSE
          </span>
        </span>
      </div>

      <main className="relative z-10">
        <Hero />
        <div ref={projRef}>
          <Projects />
        </div>
        <Timeline active={active} itemRefs={itemRefs} sectionRef={tlRef} />
      </main>
    </div>
  )
}
