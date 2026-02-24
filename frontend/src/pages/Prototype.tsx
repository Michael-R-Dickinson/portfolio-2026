import { useEffect, useRef, useState } from 'react'

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
  { x: 48, y: 72 },
  { x: 345, y: 82 },
  { x: 82, y: 308 },
  { x: 375, y: 250 },
  { x: 122, y: 388 },
  { x: 308, y: 376 },
  { x: 355, y: 162 },
  { x: 38, y: 158 },
  { x: 222, y: 382 },
  { x: 58, y: 390 },
  { x: 392, y: 372 },
  { x: 162, y: 92 },
  { x: 312, y: 105 },
  { x: 385, y: 318 },
  { x: 28, y: 250 },
  { x: 268, y: 48 },
  { x: 198, y: 138 },
  { x: 338, y: 208 },
]

function QueryRetrieval() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const t0Ref = useRef(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const W = canvas.width,
      H = canvas.height
    const LOOP = 7200

    function draw() {
      ctx.clearRect(0, 0, W, H)
      const elapsed = (Date.now() - t0Ref.current) % LOOP
      const globalA = 1 - clamp((elapsed - 5800) / 900, 0, 1)

      const bgFade = clamp(elapsed / 700, 0, 1)
      BG_PTS.forEach((n) => {
        ctx.globalAlpha = bgFade * 0.18 * globalA
        ctx.beginPath()
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = '#94a3b8'
        ctx.fill()
      })

      RETRIEVAL_NODES.forEach((n) => {
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
          const top4 = [...RETRIEVAL_NODES]
            .sort((a, b) => b.match - a.match)
            .slice(0, 4)
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
              const mc =
                n.match > 0.92
                  ? '#34d399'
                  : n.match > 0.86
                    ? '#60a5fa'
                    : '#94a3b8'
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
          const sorted = [...RETRIEVAL_NODES]
            .sort((a, b) => b.match - a.match)
            .slice(0, 4)
          sorted.forEach((n, idx) => {
            const lt = clamp(labelsT * 2.5 - idx * 0.45, 0, 1)
            if (lt <= 0) return
            const mc =
              n.match > 0.92
                ? '#34d399'
                : n.match > 0.86
                  ? '#60a5fa'
                  : '#94a3b8'
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
            ctx.fillText(
              `${(n.match * 100).toFixed(0)}% match`,
              bx + 6,
              by + 10
            )

            ctx.font = '9px monospace'
            ctx.fillStyle = 'rgba(255,255,255,0.75)'
            const truncated =
              n.label.length > 20 ? n.label.slice(0, 19) + '\u2026' : n.label
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
    <canvas ref={canvasRef} width={400} height={400} className="w-full block" />
  )
}

// =========================================================
// Option 3: Latent Space Portrait
// =========================================================
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

    const W = canvas.width,
      H = canvas.height
    const OX = 152,
      OY = 275
    const VEC_LEN = 140

    const IDEAL_ANGLE = (-78 * Math.PI) / 180
    const START_DIFF = (72 * Math.PI) / 180
    const END_DIFF = (9 * Math.PI) / 180
    const LOOP = 5400

    function drawArrow(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string
    ) {
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
      ctx.lineTo(
        x2 - hl * Math.cos(angle - 0.38),
        y2 - hl * Math.sin(angle - 0.38)
      )
      ctx.lineTo(
        x2 - hl * Math.cos(angle + 0.38),
        y2 - hl * Math.sin(angle + 0.38)
      )
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
      ctx.fillText(
        `${((diff * 180) / Math.PI).toFixed(0)}\u00b0`,
        OX + lr * Math.cos(midAngle),
        OY + lr * Math.sin(midAngle)
      )
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
      const sx = 300,
        sy = 148

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

      const bw = 116,
        bh = 7
      const bx2 = sx - bw / 2,
        by2 = sy + 34
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
    <canvas ref={canvasRef} width={400} height={400} className="w-full block" />
  )
}

// =========================================================
// Option 5: The Index Being Built
// =========================================================
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

function ForceIndex() {
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
      const cc = FORCE_CENTERS[d.group]
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

// =========================================================
// Option 6: Reaction–Diffusion Field
// =========================================================
function ReactionDiffusion() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const mouseRef = useRef<Mouse>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const GW = 130
    const GH = 130
    const N = GW * GH
    const Du = 0.21
    const Dv = 0.105
    const F = 0.037
    const K = 0.06

    const u = new Float32Array(N).fill(1)
    const v = new Float32Array(N).fill(0)
    const nu = new Float32Array(N)
    const nv = new Float32Array(N)

    for (let s = 0; s < 22; s++) {
      const sx = Math.floor(Math.random() * GW)
      const sy = Math.floor(Math.random() * GH)
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          if (dx * dx + dy * dy <= 16) {
            const ix = (sx + dx + GW) % GW
            const iy = (sy + dy + GH) % GH
            u[iy * GW + ix] = 0.5
            v[iy * GW + ix] = 0.25
          }
        }
      }
    }

    function step() {
      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          const i = y * GW + x
          const ui = u[i]
          const vi = v[i]
          const up = ((y - 1 + GH) % GH) * GW + x
          const dn = ((y + 1) % GH) * GW + x
          const lt = y * GW + ((x - 1 + GW) % GW)
          const rt = y * GW + ((x + 1) % GW)
          const lapU = u[up] + u[dn] + u[lt] + u[rt] - 4 * ui
          const lapV = v[up] + v[dn] + v[lt] + v[rt] - 4 * vi
          const uvv = ui * vi * vi
          nu[i] = Math.max(0, Math.min(1, ui + Du * lapU - uvv + F * (1 - ui)))
          nv[i] = Math.max(0, Math.min(1, vi + Dv * lapV + uvv - (F + K) * vi))
        }
      }
      u.set(nu)
      v.set(nv)
    }

    for (let i = 0; i < 280; i++) step()

    const imgData = ctx.createImageData(GW, GH)

    function draw() {
      for (let s = 0; s < 6; s++) step()

      if (mouseRef.current) {
        const mx = Math.floor((mouseRef.current.x * GW) / 400)
        const my = Math.floor((mouseRef.current.y * GH) / 400)
        for (let dy = -5; dy <= 5; dy++) {
          for (let dx = -5; dx <= 5; dx++) {
            if (dx * dx + dy * dy <= 25) {
              const ix = (mx + dx + GW) % GW
              const iy = (my + dy + GH) % GH
              u[iy * GW + ix] = 0.5
              v[iy * GW + ix] = 0.25
            }
          }
        }
      }

      for (let i = 0; i < N; i++) {
        const vn = Math.min(v[i] * 3.4, 1)
        const r = Math.floor(vn < 0.5 ? vn * 22 : lerp(11, 28, (vn - 0.5) * 2))
        const g = Math.floor(
          vn < 0.5 ? vn * 150 : lerp(75, 225, (vn - 0.5) * 2)
        )
        const b = Math.floor(10 + vn * 228)
        imgData.data[i * 4] = r
        imgData.data[i * 4 + 1] = g
        imgData.data[i * 4 + 2] = Math.min(b, 255)
        imgData.data[i * 4 + 3] = 255
      }

      ctx.putImageData(imgData, 0, 0)
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={130}
      height={130}
      className="w-full h-full block cursor-crosshair"
      style={{ imageRendering: 'pixelated' }}
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

// =========================================================
// Option 7: Semantic Search Bar
// =========================================================
const SS_QUERIES = [
  {
    text: 'infrastructure engineering at scale',
    results: [
      { title: 'SRE — Accenture', sub: 'Experience', score: 0.97 },
      { title: 'Kubernetes Platform', sub: 'Project', score: 0.93 },
      { title: 'Terraform Infra-as-Code', sub: 'Project', score: 0.9 },
      { title: 'CI/CD Automation', sub: 'Project', score: 0.85 },
    ],
  },
  {
    text: 'building ML models from scratch pytorch',
    results: [
      { title: 'ML Research — UNC', sub: 'Research', score: 0.97 },
      { title: 'Neural Net from Scratch', sub: 'Project', score: 0.93 },
      { title: 'NLP Sentiment Pipeline', sub: 'Project', score: 0.88 },
      { title: 'Data Science Intern', sub: 'Experience', score: 0.82 },
    ],
  },
  {
    text: 'applied ML with deployment pipeline',
    results: [
      { title: 'Job Application Automation', sub: 'Project', score: 0.97 },
      { title: 'Embedding Search Engine', sub: 'Project', score: 0.94 },
      { title: 'MLOps Engineering', sub: 'Experience', score: 0.9 },
      { title: 'Model Drift Monitor', sub: 'Project', score: 0.84 },
    ],
  },
]

function ssScoreColor(s: number): string {
  if (s >= 0.93) return '#34d399'
  if (s >= 0.87) return '#60a5fa'
  return '#94a3b8'
}

function SemanticSearch() {
  const [qi, setQi] = useState(0)
  const [typed, setTyped] = useState(0)
  const [cards, setCards] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const query = SS_QUERIES[qi]
    let cleared = false
    setTyped(0)
    setCards(0)
    setFading(false)

    let chars = 0
    function type() {
      if (cleared) return
      chars++
      setTyped(chars)
      if (chars < query.text.length) setTimeout(type, 52)
      else setTimeout(showCards, 550)
    }

    let c = 0
    function showCards() {
      if (cleared) return
      c++
      setCards(c)
      if (c < query.results.length) {
        setTimeout(showCards, 330)
      } else {
        setTimeout(() => {
          if (cleared) return
          setFading(true)
          setTimeout(() => {
            if (!cleared) setQi((prev) => (prev + 1) % SS_QUERIES.length)
          }, 650)
        }, 2400)
      }
    }

    setTimeout(type, 400)
    return () => {
      cleared = true
    }
  }, [qi])

  const query = SS_QUERIES[qi]

  return (
    <div
      className="w-full h-full p-5 flex flex-col gap-3"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease' }}
    >
      <p
        className="text-[10px] font-mono uppercase tracking-widest"
        style={{ color: 'var(--primary)' }}
      >
        semantic vector search
      </p>
      <div
        className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ color: '#64748b', flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="font-mono text-[11px] text-slate-200 flex-1 min-w-0">
          {query.text.slice(0, typed)}
          <span
            className="inline-block w-px h-[12px] align-middle ml-px"
            style={{
              backgroundColor: 'var(--primary)',
              animation: 'ss-blink 1s step-end infinite',
            }}
          />
        </span>
        <span className="text-[9px] font-mono text-slate-600 shrink-0">
          ada-002
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {query.results.slice(0, cards).map((r, i) => (
          <div
            key={`${qi}-${i}`}
            className="rounded-md px-3 py-2"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              animation: 'ss-slide-in 0.22s ease forwards',
            }}
          >
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="font-mono text-[11px] text-slate-200 font-medium truncate">
                {r.title}
              </span>
              <span
                className="font-mono text-[11px] font-bold tabular-nums shrink-0"
                style={{ color: ssScoreColor(r.score) }}
              >
                {r.score.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-500 shrink-0">
                {r.sub}
              </span>
              <div
                className="flex-1 h-[2px] rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${r.score * 100}%`,
                    backgroundColor: ssScoreColor(r.score),
                    transition: 'width 0.7s ease',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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
  {
    id: 'option-5',
    num: 5,
    title: 'The Index Being Built',
    description:
      'Nodes drop in from random scatter positions and force-settle into domain clusters. Flicker lines appear as the graph algorithm thinks, then faint Voronoi regions fade in around the stable topology.',
    component: <ForceIndex />,
  },
  {
    id: 'option-6',
    num: 6,
    title: 'Reaction\u2013Diffusion Field',
    description:
      'A Gray\u2013Scott reaction\u2013diffusion simulation producing organic Turing patterns \u2014 the same mathematics behind animal fur and coral. Move your cursor across the field to inject a disturbance.',
    component: <ReactionDiffusion />,
  },
  {
    id: 'option-7',
    num: 7,
    title: 'Semantic Search Bar',
    description:
      'A fake-but-realistic embedding search UI: queries typewrite in, result cards surface with cosine similarity scores that decay down the ranked list, then the whole thing loops.',
    component: <SemanticSearch />,
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
          <h1
            className="text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'Space Grotesk, system-ui' }}
          >
            Graphic Options
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-mono">
            Seven interpretations of the vector embedding concept for the hero
            section. Each is animated; options 1, 3, and 6 are interactive on
            hover.
          </p>
          <nav className="flex gap-5 pt-1">
            {SECTIONS.map((s) => (
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

        {SECTIONS.map((s) => (
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
              <p className="text-slate-400 text-sm font-mono max-w-md">
                {s.description}
              </p>
            </div>
            <div
              className="w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border border-white/10 relative"
              style={{ background: 'var(--card)' }}
            >
              {s.component}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
