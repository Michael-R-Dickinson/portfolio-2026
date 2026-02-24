import { useEffect, useRef } from 'react'
import { type Mouse } from './utils'

const EMBED_NODES = [
  // Core ML (blue)
  { label: 'PyTorch', x: -1.2, y: 0.8, z: 0.3, group: 0 },
  { label: 'TensorFlow', x: -0.8, y: 0.6, z: -0.2, group: 0 },
  { label: 'BERT', x: -1.5, y: 0.3, z: 0.5, group: 0 },
  { label: 'HuggingFace', x: -1.1, y: 0.1, z: -0.4, group: 0 },
  { label: 'Scikit-learn', x: -0.7, y: 0.9, z: 0.2, group: 0 },
  { label: 'XGBoost', x: -0.9, y: -0.1, z: 0.6, group: 0 },
  // Infrastructure (green)
  { label: 'Docker', x: 1.2, y: -0.4, z: 0.3, group: 1 },
  { label: 'Kubernetes', x: 0.8, y: -0.6, z: -0.2, group: 1 },
  { label: 'AWS', x: 1.5, y: -0.2, z: 0.5, group: 1 },
  { label: 'Terraform', x: 1.0, y: 0.1, z: -0.5, group: 1 },
  // MLOps (pink)
  { label: 'MLflow', x: 0.2, y: -0.9, z: 0.8, group: 2 },
  { label: 'Airflow', x: -0.3, y: -0.7, z: 1.1, group: 2 },
  { label: 'DVC', x: 0.4, y: -1.0, z: 0.6, group: 2 },
  { label: 'GitHub Actions', x: -0.1, y: -0.6, z: 1.3, group: 2 },
  // Languages & Tools (yellow)
  { label: 'Python', x: 0.4, y: 0.9, z: -1.0, group: 3 },
  { label: 'Go', x: 0.7, y: 0.7, z: -1.2, group: 3 },
  { label: 'FastAPI', x: 0.8, y: 0.5, z: -0.9, group: 3 },
  { label: 'Redis', x: 0.5, y: 0.3, z: -1.3, group: 3 },
  { label: 'Grafana', x: 0.1, y: -0.4, z: -1.0, group: 3 },
]

const EMBED_CONNECTIONS: [number, number][] = [
  [6, 8],
  [6, 7],
  [7, 8],
  [6, 10],
  [7, 11],
  [0, 2],
  [0, 3],
  [1, 4],
  [10, 12],
  [10, 11],
  [16, 17],
  [14, 16],
]

const GROUP_COLORS = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24']
const GROUP_LABELS = ['Core ML', 'Infrastructure', 'MLOps', 'Languages & Tools']

export function EmbeddingSpace() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleRef = useRef(0)
  const mouseRef = useRef<Mouse>(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const SCALE = Math.min(W, H) * 0.32
    const FOCAL = 4.5

    function project(x: number, y: number, z: number, angle: number) {
      const rx = x * Math.cos(angle) + z * Math.sin(angle)
      const rz = -x * Math.sin(angle) + z * Math.cos(angle)
      const depth = rz + 2.5
      const s = FOCAL / (FOCAL + depth)
      return { sx: cx + rx * SCALE * s, sy: cy - y * SCALE * s, sz: rz, s }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const angle = angleRef.current
      const proj = EMBED_NODES.map((n) => ({
        ...n,
        ...project(n.x, n.y, n.z, angle),
      }))

      EMBED_CONNECTIONS.forEach(([i, j]) => {
        const a = proj[i],
          b = proj[j]
        const alpha = 0.08 + Math.min(a.s, b.s) * 0.2
        ctx.beginPath()
        ctx.moveTo(a.sx, a.sy)
        ctx.lineTo(b.sx, b.sy)
        ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(2)})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      })

      let hoveredIdx = -1
      if (mouseRef.current) {
        let minDist = 28
        proj.forEach((p, i) => {
          const dx = p.sx - mouseRef.current!.x
          const dy = p.sy - mouseRef.current!.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < minDist) {
            minDist = d
            hoveredIdx = i
          }
        })
      }

      proj
        .map((p, i) => ({ p, i }))
        .sort((a, b) => a.p.sz - b.p.sz)
        .forEach(({ p, i }) => {
          const color = GROUP_COLORS[p.group]
          const r = Math.max(2, 4.5 * p.s)
          const isHover = i === hoveredIdx

          const grd = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, r * 5)
          grd.addColorStop(0, color + '55')
          grd.addColorStop(1, 'transparent')
          ctx.fillStyle = grd
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, r * 5, 0, Math.PI * 2)
          ctx.fill()

          ctx.beginPath()
          ctx.arc(p.sx, p.sy, isHover ? r * 1.8 : r, 0, Math.PI * 2)
          ctx.fillStyle = isHover ? '#ffffff' : color
          ctx.globalAlpha = 0.5 + 0.5 * p.s
          ctx.fill()
          ctx.globalAlpha = 1

          if (isHover) {
            ctx.font = 'bold 11px "Space Mono", monospace'
            ctx.fillStyle = '#ffffff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'bottom'
            ctx.shadowColor = 'rgba(0,0,0,0.9)'
            ctx.shadowBlur = 6
            ctx.fillText(p.label, p.sx, p.sy - r * 2.5)
            ctx.shadowBlur = 0
            ctx.textBaseline = 'alphabetic'
          }
        })

      angleRef.current += 0.004
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="space-y-3">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="w-full block cursor-crosshair"
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
      <div className="flex flex-wrap gap-4 justify-center">
        {GROUP_LABELS.map((label, i) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-xs text-slate-400 font-mono"
          >
            <span
              className="size-2 rounded-full inline-block"
              style={{ backgroundColor: GROUP_COLORS[i] }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
