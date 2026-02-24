import { useEffect, useRef } from 'react'
import { type Mouse } from './utils'

type Particle = {
  ox: number
  oy: number
  x: number
  y: number
  vx: number
  vy: number
  group: number
  alpha: number
  size: number
}

const PORTRAIT_REGION_COLORS = [
  '#60a5fa',
  '#34d399',
  '#f472b6',
  '#fbbf24',
  '#a78bfa',
]
const PORTRAIT_REGION_LABELS = [
  'Deep Learning & NLP',
  'Infrastructure & Cloud',
  'MLOps & Automation',
  'Python & Core ML',
  'Systems & Data Eng',
]

function isInPortrait(x: number, y: number): boolean {
  if (((x - 200) / 78) ** 2 + ((y - 155) / 90) ** 2 < 0.95) return true
  if (((x - 200) / 130) ** 2 + ((y - 320) / 60) ** 2 < 0.95 && y > 280)
    return true
  return false
}

function getRegion(x: number, y: number): number {
  if (y < 108) return 0
  if (x < 160 && y < 242) return 1
  if (x > 240 && y < 242) return 2
  if (y > 258) return 4
  return 3
}

function buildParticles(): Particle[] {
  const particles: Particle[] = []
  for (let gx = 78; gx <= 322; gx += 10) {
    for (let gy = 52; gy <= 398; gy += 10) {
      if (isInPortrait(gx, gy)) {
        const jx = gx + (Math.random() - 0.5) * 7
        const jy = gy + (Math.random() - 0.5) * 7
        particles.push({
          ox: jx,
          oy: jy,
          x: jx,
          y: jy,
          vx: 0,
          vy: 0,
          group: getRegion(jx, jy),
          alpha: 0.55 + Math.random() * 0.45,
          size: 1.4 + Math.random() * 1.4,
        })
      }
    }
  }
  for (let i = 0; i < 85; i++) {
    const bx = Math.random() * 400
    const by = Math.random() * 400
    particles.push({
      ox: bx,
      oy: by,
      x: bx,
      y: by,
      vx: 0,
      vy: 0,
      group: -1,
      alpha: 0.06 + Math.random() * 0.07,
      size: 1 + Math.random() * 0.8,
    })
  }
  return particles
}

export function LatentPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const mouseRef = useRef<Mouse>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    particlesRef.current = buildParticles()

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const W = canvas.width,
      H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)

      let hoveredRegion = -2
      if (mouseRef.current) {
        const { x, y } = mouseRef.current
        if (isInPortrait(x, y)) hoveredRegion = getRegion(x, y)
      }

      for (const p of particlesRef.current) {
        p.vx += (Math.random() - 0.5) * 0.055
        p.vy += (Math.random() - 0.5) * 0.055
        p.vx -= (p.x - p.ox) * 0.022
        p.vy -= (p.y - p.oy) * 0.022
        p.vx *= 0.91
        p.vy *= 0.91
        p.x += p.vx
        p.y += p.vy

        const isBg = p.group === -1
        let alpha = p.alpha
        let size = p.size
        const color = isBg ? '#ffffff' : PORTRAIT_REGION_COLORS[p.group]

        if (!isBg && hoveredRegion !== -2) {
          if (p.group === hoveredRegion) {
            alpha = 1
            size = p.size * 1.9
          } else {
            alpha = p.alpha * 0.15
          }
        }

        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }

      ctx.globalAlpha = 1

      if (hoveredRegion >= 0) {
        const label = PORTRAIT_REGION_LABELS[hoveredRegion]
        const color = PORTRAIT_REGION_COLORS[hoveredRegion]
        ctx.font = 'bold 12px "Space Mono", monospace'
        const tw = ctx.measureText(label).width
        const lx = W / 2,
          ly = H - 18
        ctx.fillStyle = 'rgba(8,12,22,0.92)'
        ctx.beginPath()
        ctx.roundRect(lx - tw / 2 - 12, ly - 16, tw + 24, 22, 5)
        ctx.fill()
        ctx.fillStyle = color
        ctx.textAlign = 'center'
        ctx.fillText(label, lx, ly)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="w-full block cursor-default"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseRef.current = {
          x: (e.clientX - rect.left) * (400 / rect.width),
          y: (e.clientY - rect.top) * (400 / rect.height),
        }
      }}
      onMouseLeave={() => {
        mouseRef.current = null
      }}
    />
  )
}
