import './styles.css'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { profile, timeline } from '../../content'
import { FlightLog } from './components/FlightLog'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { clamp01, flight, type Phase } from './flight'
import { useReducedMotion } from './hooks/useReducedMotion'

const Scene = lazy(() => import('./components/Scene').then((m) => ({ default: m.Scene })))

export default function Page() {
  const reduced = useReducedMotion()
  const projectsRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLElement>(null)
  const hudRef = useRef<HTMLSpanElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('hero')
  const [active, setActive] = useState(0)

  // Scroll → flight store (read every frame by the 3D rig). React state only for coarse phase/active card.
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      flight.hero = clamp01(window.scrollY / (vh * 0.75))
      const pr = projectsRef.current?.getBoundingClientRect()
      if (pr) flight.projects = clamp01((vh - pr.top) / (pr.height + vh * 0.1))
      const tl = timelineRef.current
      if (tl) {
        const r = tl.getBoundingClientRect()
        flight.tlBlend = clamp01((vh - r.top) / (vh * 0.65))
        const centers = Array.from(tl.querySelectorAll<HTMLElement>('[data-wp]'), (el) => {
          const b = el.getBoundingClientRect()
          return b.top + b.height / 2
        })
        // reference line slides down near the page end so the last waypoint is reachable
        const remaining = document.documentElement.scrollHeight - vh - window.scrollY
        const mid = vh * (0.5 + 0.32 * clamp01(1 - remaining / (vh * 0.6)))
        let f = 0
        if (centers.length) {
          if (mid >= centers[centers.length - 1]) f = centers.length - 1
          else
            for (let i = 0; i < centers.length - 1; i++) {
              if (mid >= centers[i] && mid < centers[i + 1]) {
                f = i + (mid - centers[i]) / (centers[i + 1] - centers[i])
                break
              }
            }
        }
        flight.tlIndex = f
      }
      setPhase(flight.tlBlend > 0.5 ? 'timeline' : flight.hero > 0.6 ? 'projects' : 'hero')
      setActive(Math.round(flight.tlIndex))
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
    }
  }, [])

  return (
    <div className="concept-d" data-phase={phase}>
      <div className="cd-canvas" aria-hidden="true">
        <Suspense fallback={null}>
          <Scene reduced={reduced} phase={phase} hudRef={hudRef} labelsRef={labelsRef} />
        </Suspense>
        <div className="cd-wp-labels" ref={labelsRef}>
          {timeline.map((e, i) => (
            <div key={e.id} className={`cd-wp-label ${e.status === 'future' ? 'is-future' : ''}`}>
              <span>WP{String(i + 1).padStart(2, '0')}</span> {/^\d{4}$/.test(e.year) ? `’${e.year.slice(2)}` : e.year}
            </div>
          ))}
        </div>
      </div>

      {/* viewfinder overlay shown while the drone "streams" the projects */}
      <div className="cd-viewfinder" aria-hidden="true">
        <i className="tl" />
        <i className="tr" />
        <i className="bl" />
        <i className="br" />
        <i className="cross" />
      </div>

      <div className="cd-telemetry" aria-hidden="true">
        <span className="cd-dot" />
        <span ref={hudRef}>LOITER</span>
      </div>

      <main className="cd-content">
        <Hero />
        <Projects ref={projectsRef} />
        <FlightLog ref={timelineRef} active={active} />
        <footer className="cd-footer">
          <a href="#top">↑ Return to launch</a>
          <span>
            © {profile.name} · {profile.location} · <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </span>
        </footer>
      </main>
    </div>
  )
}
