import { useEffect, useRef } from 'react'

type Mouse = { x: number; y: number } | null

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}
function easeOut3(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

// =========================================================
// Option 1: The Embedding Space
// =========================================================
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
  [6, 8], [6, 7], [7, 8],
  [6, 10], [7, 11],
  [0, 2], [0, 3],
  [1, 4],
  [10, 12], [10, 11],
  [16, 17], [14, 16],
]

const GROUP_COLORS = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24']
const GROUP_LABELS = ['Core ML', 'Infrastructure', 'MLOps', 'Languages & Tools']

function EmbeddingSpace() {
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
      const proj = EMBED_NODES.map(n => ({ ...n, ...project(n.x, n.y, n.z, angle) }))

      EMBED_CONNECTIONS.forEach(([i, j]) => {
        const a = proj[i], b = proj[j]
        const alpha = 0.08 + Math.min(a.s, b.s) * 0.20
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
          if (d < minDist) { minDist = d; hoveredIdx = i }
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
        onMouseLeave={() => { mouseRef.current = null }}
      />
      <div className="flex flex-wrap gap-4 justify-center">
        {GROUP_LABELS.map((label, i) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span className="size-2 rounded-full inline-block" style={{ backgroundColor: GROUP_COLORS[i] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

// =========================================================
// Option 2: Query → Retrieval
// =========================================================
const RETRIEVAL_NODES = [
  { label: 'Distributed Training', match: 0.97, x: 242, y: 202 },
  { label: 'MLOps Intern @ DataCore', match: 0.94, x: 145, y: 242 },
  { label: 'Model Drift Monitor', match: 0.88, x: 308, y: 288 },
  { label: 'Sentiment API', match: 0.83, x: 175, y: 332 },
  { label: 'Data Engineering', match: 0.74, x: 68, y: 188 },
]

const BG_PTS = [
  { x: 48, y: 72 }, { x: 345, y: 82 }, { x: 82, y: 308 },
  { x: 375, y: 250 }, { x: 122, y: 388 }, { x: 308, y: 376 },
  { x: 355, y: 162 }, { x: 38, y: 158 }, { x: 222, y: 382 },
  { x: 58, y: 390 }, { x: 392, y: 372 }, { x: 162, y: 92 },
  { x: 312, y: 105 }, { x: 385, y: 318 }, { x: 28, y: 250 },
  { x: 268, y: 48 }, { x: 198, y: 138 }, { x: 338, y: 208 },
]

function QueryRetrieval() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const t0Ref = useRef(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const W = canvas.width, H = canvas.height
    const LOOP = 7200

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const elapsed = (Date.now() - t0Ref.current) % LOOP
      const globalA = 1 - clamp((elapsed - 5800) / 900, 0, 1)

      const bgFade = clamp(elapsed / 700, 0, 1)
      BG_PTS.forEach(n => {
        ctx.globalAlpha = bgFade * 0.18 * globalA
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = '#94a3b8'
        ctx.fill()
      })

      RETRIEVAL_NODES.forEach(n => {
        ctx.globalAlpha = bgFade * 0.15 * globalA
        ctx.beginPath()
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#60a5fa'
        ctx.fill()
      })

      const queryT = clamp((elapsed - 600) / 900, 0, 1)
      if (queryT > 0) {
        const qy = lerp(-20, 78, easeOut3(queryT))

        ctx.globalAlpha = easeOut3(queryT) * globalA
        const grd = ctx.createRadialGradient(W / 2, qy, 0, W / 2, qy, 32)
        grd.addColorStop(0, 'rgba(251,191,36,0.75)')
        grd.addColorStop(1, 'transparent')
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(W / 2, qy, 32, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(W / 2, qy, 7, 0, Math.PI * 2)
        ctx.fillStyle = '#fbbf24'
        ctx.fill()

        ctx.font = 'bold 10px "Space Mono", monospace'
        ctx.fillStyle = '#fbbf24'
        ctx.textAlign = 'center'
        ctx.fillText('query: MLOps engineer', W / 2, qy - 16)
        ctx.globalAlpha = 1

        const linesT = clamp((elapsed - 1600) / 1600, 0, 1)
        if (linesT > 0) {
          const top4 = [...RETRIEVAL_NODES].sort((a, b) => b.match - a.match).slice(0, 4)
          top4.forEach((n, idx) => {
            const lineT = clamp(linesT * 1.8 - idx * 0.32, 0, 1)
            if (lineT <= 0) return

            const ex = lerp(W / 2, n.x, easeOut3(lineT))
            const ey = lerp(qy, n.y, easeOut3(lineT))
            ctx.globalAlpha = (0.5 - idx * 0.07) * globalA
            ctx.beginPath()
            ctx.moveTo(W / 2, qy)
            ctx.lineTo(ex, ey)
            ctx.strokeStyle = '#fbbf24'
            ctx.lineWidth = 1.5 - idx * 0.15
            ctx.setLineDash([5, 4])
            ctx.stroke()
            ctx.setLineDash([])

            if (lineT > 0.88) {
              const arrT = clamp((lineT - 0.88) / 0.12, 0, 1)
              const mc = n.match > 0.92 ? '#34d399' : n.match > 0.86 ? '#60a5fa' : '#94a3b8'
              const ngrd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 22)
              ngrd.addColorStop(0, mc + '88')
              ngrd.addColorStop(1, 'transparent')
              ctx.globalAlpha = arrT * globalA
              ctx.fillStyle = ngrd
              ctx.beginPath()
              ctx.arc(n.x, n.y, 22, 0, Math.PI * 2)
              ctx.fill()
              ctx.beginPath()
              ctx.arc(n.x, n.y, 5, 0, Math.PI * 2)
              ctx.fillStyle = mc
              ctx.fill()
            }
            ctx.globalAlpha = 1
          })
        }

        const labelsT = clamp((elapsed - 3300) / 2200, 0, 1)
        if (labelsT > 0) {
          const sorted = [...RETRIEVAL_NODES].sort((a, b) => b.match - a.match).slice(0, 4)
          sorted.forEach((n, idx) => {
            const lt = clamp(labelsT * 2.5 - idx * 0.45, 0, 1)
            if (lt <= 0) return
            const mc = n.match > 0.92 ? '#34d399' : n.match > 0.86 ? '#60a5fa' : '#94a3b8'
            ctx.globalAlpha = lt * globalA

            const bx = clamp(n.x > 210 ? n.x - 148 : n.x + 10, 2, 258)
            const by = n.y - 14
            ctx.fillStyle = 'rgba(10,15,30,0.92)'
            ctx.beginPath()
            ctx.roundRect(bx, by, 140, 28, 4)
            ctx.fill()

            ctx.font = 'bold 9px monospace'
            ctx.fillStyle = mc
            ctx.textAlign = 'left'
            ctx.fillText(`${(n.match * 100).toFixed(0)}% match`, bx + 6, by + 10)

            ctx.font = '9px monospace'
            ctx.fillStyle = 'rgba(255,255,255,0.75)'
            const truncated = n.label.length > 20 ? n.label.slice(0, 19) + '\u2026' : n.label
            ctx.fillText(truncated, bx + 6, by + 22)

            ctx.globalAlpha = 1
          })
        }
      }

      ctx.globalAlpha = 1
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
      className="w-full block"
    />
  )
}

// =========================================================
// Option 3: Latent Space Portrait
// =========================================================
type Particle = {
  ox: number; oy: number
  x: number; y: number
  vx: number; vy: number
  group: number
  alpha: number
  size: number
}

const PORTRAIT_REGION_COLORS = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa']
const PORTRAIT_REGION_LABELS = [
  'Deep Learning & NLP',
  'Infrastructure & Cloud',
  'MLOps & Automation',
  'Python & Core ML',
  'Systems & Data Eng',
]

function isInPortrait(x: number, y: number): boolean {
  if (((x - 200) / 78) ** 2 + ((y - 155) / 90) ** 2 < 0.95) return true
  if (((x - 200) / 130) ** 2 + ((y - 320) / 60) ** 2 < 0.95 && y > 280) return true
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
          ox: jx, oy: jy, x: jx, y: jy,
          vx: 0, vy: 0,
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
      ox: bx, oy: by, x: bx, y: by,
      vx: 0, vy: 0,
      group: -1,
      alpha: 0.06 + Math.random() * 0.07,
      size: 1 + Math.random() * 0.8,
    })
  }
  return particles
}

function LatentPortrait() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const mouseRef = useRef<Mouse>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    particlesRef.current = buildParticles()

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const W = canvas.width, H = canvas.height

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
        const lx = W / 2, ly = H - 18
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
      onMouseLeave={() => { mouseRef.current = null }}
    />
  )
}

// =========================================================
// Option 4: Live Cosine Similarity Meter
// =========================================================
function CosineMeter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const t0Ref = useRef(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const W = canvas.width, H = canvas.height
    const OX = 152, OY = 275
    const VEC_LEN = 140

    const IDEAL_ANGLE = (-78 * Math.PI) / 180
    const START_DIFF = (72 * Math.PI) / 180
    const END_DIFF = (9 * Math.PI) / 180
    const LOOP = 5400

    function drawArrow(x1: number, y1: number, x2: number, y2: number, color: string) {
      const angle = Math.atan2(y2 - y1, x2 - x1)
      const hl = 10
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = color
      ctx.lineWidth = 2.2
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x2, y2)
      ctx.lineTo(x2 - hl * Math.cos(angle - 0.38), y2 - hl * Math.sin(angle - 0.38))
      ctx.lineTo(x2 - hl * Math.cos(angle + 0.38), y2 - hl * Math.sin(angle + 0.38))
      ctx.closePath()
      ctx.fillStyle = color
      ctx.fill()
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)

      const elapsed = (Date.now() - t0Ref.current) % LOOP
      const rawT = clamp(elapsed / 3800, 0, 1)
      const t = easeInOut(rawT)
      const diff = lerp(START_DIFF, END_DIFF, t)
      const cosVal = Math.cos(diff)

      const idealX2 = OX + VEC_LEN * Math.cos(IDEAL_ANGLE)
      const idealY2 = OY + VEC_LEN * Math.sin(IDEAL_ANGLE)
      const michaelAngle = IDEAL_ANGLE + diff
      const michaelX2 = OX + VEC_LEN * Math.cos(michaelAngle)
      const michaelY2 = OY + VEC_LEN * Math.sin(michaelAngle)

      // Angle arc fill
      ctx.beginPath()
      ctx.moveTo(OX, OY)
      ctx.arc(OX, OY, 52, IDEAL_ANGLE, michaelAngle)
      ctx.closePath()
      ctx.fillStyle = 'rgba(251,191,36,0.07)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(OX, OY, 52, IDEAL_ANGLE, michaelAngle)
      ctx.strokeStyle = 'rgba(251,191,36,0.5)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Angle label
      const midAngle = (IDEAL_ANGLE + michaelAngle) / 2
      const lr = 72
      ctx.font = '10px monospace'
      ctx.fillStyle = 'rgba(251,191,36,0.85)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${(diff * 180 / Math.PI).toFixed(0)}\u00b0`, OX + lr * Math.cos(midAngle), OY + lr * Math.sin(midAngle))
      ctx.textBaseline = 'alphabetic'

      drawArrow(OX, OY, idealX2, idealY2, '#60a5fa')
      drawArrow(OX, OY, michaelX2, michaelY2, '#34d399')

      // Vector labels
      ctx.font = 'bold 9px monospace'
      ctx.fillStyle = '#60a5fa'
      ctx.textAlign = 'right'
      ctx.fillText('ideal MLE candidate', idealX2 - 8, idealY2 - 8)
      ctx.fillStyle = '#34d399'
      ctx.textAlign = michaelX2 < OX ? 'right' : 'left'
      const mx = michaelX2 < OX ? michaelX2 - 8 : michaelX2 + 8
      ctx.fillText('Michael Dickinson', mx, michaelY2 + 14)

      // Origin
      ctx.beginPath()
      ctx.arc(OX, OY, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#ffffff'
      ctx.fill()

      // Score panel (right-center)
      const sx = 300, sy = 148

      const scoreR = Math.round(lerp(96, 52, t))
      const scoreG = Math.round(lerp(165, 211, t))
      const scoreB = Math.round(lerp(250, 153, t))
      const scoreColor = `rgb(${scoreR},${scoreG},${scoreB})`

      ctx.font = 'bold 46px "Space Mono", monospace'
      ctx.fillStyle = scoreColor
      ctx.textAlign = 'center'
      ctx.fillText(cosVal.toFixed(2), sx, sy)

      ctx.font = '9px monospace'
      ctx.fillStyle = 'rgba(255,255,255,0.38)'
      ctx.fillText('cosine_similarity(a, b)', sx, sy + 18)

      const bw = 116, bh = 7
      const bx2 = sx - bw / 2, by2 = sy + 34
      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.beginPath()
      ctx.roundRect(bx2, by2, bw, bh, 3)
      ctx.fill()
      ctx.fillStyle = scoreColor
      ctx.beginPath()
      ctx.roundRect(bx2, by2, bw * clamp(cosVal, 0.01, 1), bh, 3)
      ctx.fill()

      ctx.font = '9px monospace'
      ctx.fillStyle = 'rgba(255,255,255,0.22)'
      ctx.textAlign = 'center'
      ctx.fillText('cos(\u03b8) = a\u00b7b / |a||b|', sx, by2 + bh + 18)

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
      className="w-full block"
    />
  )
}

// =========================================================
// Prototype page
// =========================================================
const SECTIONS = [
  {
    id: 'option-1',
    num: 1,
    title: 'The Embedding Space',
    description:
      'A 3D scatter plot rotating on a fixed axis. Skills are clustered by domain; similarity lines connect related nodes. Hover to reveal labels. You are the query vector.',
    component: <EmbeddingSpace />,
  },
  {
    id: 'option-2',
    num: 2,
    title: 'Query \u2192 Retrieval',
    description:
      'A looping vector DB query animation: a query vector drops in, nearest-neighbor lines radiate outward, and top results surface with match scores.',
    component: <QueryRetrieval />,
  },
  {
    id: 'option-3',
    num: 3,
    title: 'The Latent Space Portrait',
    description:
      'A field of particles forming a rough portrait silhouette. All particles drift slowly with spring physics. Hover over regions to reveal skill domain labels.',
    component: <LatentPortrait />,
  },
  {
    id: 'option-4',
    num: 4,
    title: 'Live Cosine Similarity',
    description:
      'Two vectors converging as the animation plays \u2014 one labeled \u201cideal MLE candidate\u201d, one \u201cMichael Dickinson\u201d. The cosine similarity ticks toward 1.0.',
    component: <CosineMeter />,
  },
]

export function Prototype() {
  return (
    <div className="dot-matrix-bg min-h-screen w-full text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-24">
        <header className="space-y-4">
          <p className="text-xs text-primary font-mono uppercase tracking-widest">
            Hero Section / Prototypes
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'Space Grotesk, system-ui' }}>
            Graphic Options
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-mono">
            Four interpretations of the vector embedding concept for the hero section.
            Each is animated; options 1 and 3 are interactive on hover.
          </p>
          <nav className="flex gap-5 pt-1">
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-mono text-slate-500 hover:text-primary transition-colors"
              >
                [{s.num}] {s.title}
              </a>
            ))}
          </nav>
        </header>

        {SECTIONS.map(s => (
          <section key={s.id} id={s.id} className="space-y-6">
            <div className="space-y-1.5 border-l-2 border-primary pl-4">
              <p className="text-xs font-mono text-primary uppercase tracking-widest">
                Option {s.num}
              </p>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: 'Space Grotesk, system-ui' }}
              >
                {s.title}
              </h2>
              <p className="text-slate-400 text-sm font-mono max-w-md">{s.description}</p>
            </div>
            <div className="w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border border-white/10 relative" style={{ background: 'var(--card)' }}>
              {s.component}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
