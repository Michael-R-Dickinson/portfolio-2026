import { useEffect, useRef } from 'react'
import { clamp, lerp, easeInOut } from './utils'

export function CosineMeter() {
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
