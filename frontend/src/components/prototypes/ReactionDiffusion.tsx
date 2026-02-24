import { useEffect, useRef } from 'react'
import { type Mouse, lerp } from './utils'

export function ReactionDiffusion() {
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
