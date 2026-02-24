import { useEffect, useRef } from 'react'
import { clamp } from './utils'

const FORCE_COLORS = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24']
const FORCE_DOMAINS = ['ML', 'Infrastructure', 'Systems', 'Frontend']
const FORCE_CENTERS = [
  { x: 118, y: 128 },
  { x: 282, y: 128 },
  { x: 118, y: 280 },
  { x: 282, y: 280 },
]
const FORCE_NODES_DATA = [
  { label: 'PyTorch', group: 0 },
  { label: 'Transformers', group: 0 },
  { label: 'Scikit-learn', group: 0 },
  { label: 'BERT', group: 0 },
  { label: 'Docker', group: 1 },
  { label: 'Kubernetes', group: 1 },
  { label: 'AWS', group: 1 },
  { label: 'Terraform', group: 1 },
  { label: 'Go', group: 2 },
  { label: 'Redis', group: 2 },
  { label: 'gRPC', group: 2 },
  { label: 'PostgreSQL', group: 2 },
  { label: 'React', group: 3 },
  { label: 'TypeScript', group: 3 },
  { label: 'Tailwind', group: 3 },
  { label: 'Vite', group: 3 },
]
const FORCE_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [4, 5],
  [4, 6],
  [5, 7],
  [8, 9],
  [9, 10],
  [8, 11],
  [12, 13],
  [13, 14],
  [12, 15],
  [0, 4],
  [2, 8],
  [6, 10],
]

type FNode = {
  label: string
  group: number
  x: number
  y: number
  vx: number
  vy: number
  spawnAt: number
  alive: boolean
}

export function ForceIndex() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const t0Ref = useRef(0)
  const nodesRef = useRef<FNode[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height

    t0Ref.current = Date.now()
    nodesRef.current = FORCE_NODES_DATA.map((d, i) => {
      return {
        ...d,
        x: (Math.random() - 0.5) * 320,
        y: (Math.random() - 0.5) * 320,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        spawnAt: 100 + i * 130,
        alive: false,
      }
    })

    function draw() {
      const elapsed = Date.now() - t0Ref.current
      ctx.clearRect(0, 0, W, H)
      const nodes = nodesRef.current

      nodes.forEach((n) => {
        if (!n.alive && elapsed >= n.spawnAt) n.alive = true
      })

      const lastSpawn = nodes[nodes.length - 1].spawnAt
      const allAlive = elapsed >= lastSpawn
      const settledT = allAlive
        ? clamp((elapsed - lastSpawn - 400) / 800, 0, 1)
        : 0

      for (const n of nodes) {
        if (!n.alive) continue
        const cc = FORCE_CENTERS[n.group]
        const springK = 0.05 + settledT * 0.07
        n.vx += (cc.x - n.x) * springK
        n.vy += (cc.y - n.y) * springK

        for (const m of nodes) {
          if (m === n || !m.alive) continue
          const dx = n.x - m.x
          const dy = n.y - m.y
          const d2 = Math.max(dx * dx + dy * dy, 200)
          if (d2 < 3600) {
            const f = 200 / d2
            n.vx += dx * f
            n.vy += dy * f
          }
        }

        n.vx *= 0.8
        n.vy *= 0.8

        if (allAlive) {
          const msSince = elapsed - lastSpawn
          const maxSpeed = Math.max(0.4, 5 * Math.exp(-msSince / 700))
          const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
          if (speed > maxSpeed) {
            n.vx = (n.vx / speed) * maxSpeed
            n.vy = (n.vy / speed) * maxSpeed
          }
        }

        n.x = clamp(n.x + n.vx, 16, W - 16)
        n.y = clamp(n.y + n.vy, 16, H - 16)
      }

      if (settledT > 0) {
        FORCE_CENTERS.forEach((cc, g) => {
          const grd = ctx.createRadialGradient(cc.x, cc.y, 0, cc.x, cc.y, 110)
          grd.addColorStop(0, FORCE_COLORS[g] + '44')
          grd.addColorStop(0.55, FORCE_COLORS[g] + '18')
          grd.addColorStop(1, 'transparent')
          ctx.globalAlpha = settledT * 0.22
          ctx.fillStyle = grd
          ctx.beginPath()
          ctx.arc(cc.x, cc.y, 110, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      ctx.globalAlpha = settledT * 0.28
      FORCE_EDGES.forEach(([i, j]) => {
        const a = nodes[i],
          b = nodes[j]
        if (!a?.alive || !b?.alive) return
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle =
          a.group === b.group ? FORCE_COLORS[a.group] : '#ffffff'
        ctx.lineWidth = 0.7
        ctx.stroke()
      })
      ctx.globalAlpha = 1

      if (settledT < 0.8) {
        for (let f = 0; f < Math.floor(Math.random() * 3); f++) {
          const ai = Math.floor(Math.random() * nodes.length)
          const bi = Math.floor(Math.random() * nodes.length)
          const a = nodes[ai],
            b = nodes[bi]
          if (!a?.alive || !b?.alive || ai === bi) continue
          ctx.globalAlpha = Math.random() * 0.2
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 0.5
          ctx.setLineDash([3, 6])
          ctx.stroke()
          ctx.setLineDash([])
        }
        ctx.globalAlpha = 1
      }

      for (const n of nodes) {
        if (!n.alive) continue
        const color = FORCE_COLORS[n.group]
        const r = 4
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4.5)
        grd.addColorStop(0, color + '55')
        grd.addColorStop(1, 'transparent')
        ctx.globalAlpha = 0.8
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * 4.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        if (settledT > 0.5) {
          ctx.globalAlpha = clamp((settledT - 0.5) / 0.5, 0, 1) * 0.65
          ctx.font = '8.5px "Space Mono", monospace'
          ctx.fillStyle = '#cbd5e1'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(n.label, n.x, n.y - r - 2)
          ctx.textBaseline = 'alphabetic'
          ctx.globalAlpha = 1
        }
      }

      if (settledT > 0.7) {
        const la = clamp((settledT - 0.7) / 0.3, 0, 1)
        FORCE_CENTERS.forEach((cc, g) => {
          ctx.globalAlpha = la * 0.5
          ctx.font = 'bold 9px "Space Mono", monospace'
          ctx.fillStyle = FORCE_COLORS[g]
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(FORCE_DOMAINS[g], cc.x, cc.y - 54)
          ctx.textBaseline = 'alphabetic'
          ctx.globalAlpha = 1
        })
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <canvas ref={canvasRef} width={400} height={400} className="w-full block" />
  )
}
