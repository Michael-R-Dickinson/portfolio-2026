import { useEffect, useRef } from 'react'
import { clamp, lerp, easeOut3 } from './utils'

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

export function QueryRetrieval() {
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
