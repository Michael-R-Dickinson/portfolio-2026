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

const FORCE_CONFIG = {
  SPAWN_DELAY_BASE: 100, // Initial delay before the first node starts spawning (ms)
  SPAWN_DELAY_STEP: 130, // Delay between consecutive node spawns (ms)
  SPRING_K_BASE: 0.05, // Initial spring stiffness pulling nodes to their group center
  SPRING_K_SETTLED: 0.07, // Additional stiffness added as the simulation settles
  REPULSION_MIN_D2: 200, // Minimum squared distance for repulsion to prevent infinite force
  REPULSION_MAX_D2: 3600, // Maximum squared distance for repulsion; beyond this, nodes don't repel
  REPULSION_STRENGTH: 200, // Multiplier for the repulsion force between nodes
  DAMPING: 0.8, // Velocity preservation factor (0 = stop, 1 = no friction)
  SETTLE_DELAY: 400, // Delay after all nodes have spawned before settling starts (ms)
  SETTLE_DURATION: 400, // Duration of the settling transition (ms)
  SPEED_LIMIT_DECAY: 1000, // Rate at which the maximum allowed speed decreases over time
  SPEED_LIMIT_MIN: 0.4, // Final minimum speed limit for nodes once settled
  SPEED_LIMIT_MAX: 5, // Initial maximum speed limit for nodes during spawning
  CLUSTER_RADIUS: 110, // Radius of the background glow for each node group
  CLUSTER_ALPHA: 0.22, // Maximum opacity of the group background glow
  EDGE_ALPHA: 0.28, // Maximum opacity of the lines connecting nodes
  EDGE_WIDTH: 0.7, // Thickness of the lines connecting nodes
  NOISE_THRESHOLD: 0.8, // Progression point (0-1) after which random 'noise' lines stop appearing
  NOISE_MAX_COUNT: 3, // Maximum number of random noise lines drawn per frame
  NOISE_ALPHA: 0.2, // Maximum opacity of the random noise lines
  NOISE_WIDTH: 0.5, // Thickness of the random noise lines
  NODE_RADIUS: 4, // Radius of the solid circle representing each node
  NODE_GLOW_MUL: 4.5, // Multiplier for the node's individual radial glow radius
  LABEL_THRESHOLD: 0.5, // Progression point (0-1) when node labels start to fade in
  LABEL_ALPHA: 0.65, // Final opacity of the node text labels
  DOMAIN_THRESHOLD: 0.7, // Progression point (0-1) when group category labels start to fade in
  DOMAIN_ALPHA: 0.9, // Final opacity of the group category labels
  DOMAIN_OFFSET: 54, // Vertical distance from group center to place the category label
  DOMAIN_FONT_SIZE: 12, // Font size for category labels in pixels
  LABEL_REPULSION_STRENGTH: 450, // Multiplier for the repulsion force from category labels
  LABEL_REPULSION_MAX_D2: 2000, // Maximum squared distance for label repulsion (~45px)
  ANIMATION_STOP_TIME: 5000, // Time after which the animation freezes (ms)
}

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

    // Handle high-DPI (Retina) displays
    const dpr = window.devicePixelRatio || 1
    const logicalW = 400
    const logicalH = 400

    canvas.width = logicalW * dpr
    canvas.height = logicalH * dpr
    canvas.style.width = `${logicalW}px`
    canvas.style.height = `${logicalH}px`

    ctx.scale(dpr, dpr)

    const W = logicalW
    const H = logicalH

    t0Ref.current = Date.now()
    nodesRef.current = FORCE_NODES_DATA.map((d, i) => {
      return {
        ...d,
        x: (Math.random() - 0.5) * 320,
        y: (Math.random() - 0.5) * 320,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        spawnAt:
          FORCE_CONFIG.SPAWN_DELAY_BASE + i * FORCE_CONFIG.SPAWN_DELAY_STEP,
        alive: false,
      }
    })

    function draw() {
      const elapsed = Date.now() - t0Ref.current

      const isFinished = elapsed >= FORCE_CONFIG.ANIMATION_STOP_TIME

      ctx.clearRect(0, 0, W, H)

      const nodes = nodesRef.current

      if (!isFinished) {
        nodes.forEach((n) => {
          if (!n.alive && elapsed >= n.spawnAt) n.alive = true
        })

        const lastSpawn = nodes[nodes.length - 1].spawnAt

        const allAlive = elapsed >= lastSpawn

        const settledT = allAlive
          ? clamp(
              (elapsed - lastSpawn - FORCE_CONFIG.SETTLE_DELAY) /
                FORCE_CONFIG.SETTLE_DURATION,

              0,

              1
            )
          : 0

        for (const n of nodes) {
          if (!n.alive) continue

          const cc = FORCE_CENTERS[n.group]

          const springK =
            FORCE_CONFIG.SPRING_K_BASE +
            settledT * FORCE_CONFIG.SPRING_K_SETTLED

          n.vx += (cc.x - n.x) * springK

          n.vy += (cc.y - n.y) * springK

          // Repulsion from category label

          if (settledT > FORCE_CONFIG.DOMAIN_THRESHOLD) {
            const lx = cc.x

            const ly = cc.y - FORCE_CONFIG.DOMAIN_OFFSET

            const dx = n.x - lx

            const dy = n.y - ly

            const d2 = Math.max(dx * dx + dy * dy, 100)

            if (d2 < FORCE_CONFIG.LABEL_REPULSION_MAX_D2) {
              const la = clamp(
                (settledT - FORCE_CONFIG.DOMAIN_THRESHOLD) /
                  (1 - FORCE_CONFIG.DOMAIN_THRESHOLD),

                0,

                1
              )

              const f = (FORCE_CONFIG.LABEL_REPULSION_STRENGTH * la) / d2

              n.vx += dx * f

              n.vy += dy * f
            }
          }

          for (const m of nodes) {
            if (m === n || !m.alive) continue

            const dx = n.x - m.x

            const dy = n.y - m.y

            const d2 = Math.max(
              dx * dx + dy * dy,
              FORCE_CONFIG.REPULSION_MIN_D2
            )

            if (d2 < FORCE_CONFIG.REPULSION_MAX_D2) {
              const f = FORCE_CONFIG.REPULSION_STRENGTH / d2

              n.vx += dx * f

              n.vy += dy * f
            }
          }

          n.vx *= FORCE_CONFIG.DAMPING

          n.vy *= FORCE_CONFIG.DAMPING

          if (allAlive) {
            const msSince = elapsed - lastSpawn

            const maxSpeed = Math.max(
              FORCE_CONFIG.SPEED_LIMIT_MIN,

              FORCE_CONFIG.SPEED_LIMIT_MAX *
                Math.exp(-msSince / FORCE_CONFIG.SPEED_LIMIT_DECAY)
            )

            const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)

            if (speed > maxSpeed) {
              n.vx = (n.vx / speed) * maxSpeed

              n.vy = (n.vy / speed) * maxSpeed
            }
          }

          n.x = clamp(n.x + n.vx, 16, W - 16)

          n.y = clamp(n.y + n.vy, 16, H - 16)
        }
      } else {
        // Zero out velocities when stopped

        nodes.forEach((n) => {
          n.vx = 0

          n.vy = 0
        })
      }

      // Re-calculate settledT for drawing even when finished

      const lastSpawn = nodes[nodes.length - 1].spawnAt

      const allAlive = elapsed >= lastSpawn

      const displayElapsed = Math.min(elapsed, FORCE_CONFIG.ANIMATION_STOP_TIME)

      const settledT = allAlive
        ? clamp(
            (displayElapsed - lastSpawn - FORCE_CONFIG.SETTLE_DELAY) /
              FORCE_CONFIG.SETTLE_DURATION,

            0,

            1
          )
        : 0

      if (settledT > 0) {
        FORCE_CENTERS.forEach((cc, g) => {
          const grd = ctx.createRadialGradient(
            cc.x,
            cc.y,
            0,
            cc.x,
            cc.y,
            FORCE_CONFIG.CLUSTER_RADIUS
          )
          grd.addColorStop(0, FORCE_COLORS[g] + '44')
          grd.addColorStop(0.55, FORCE_COLORS[g] + '18')
          grd.addColorStop(1, 'transparent')
          ctx.globalAlpha = settledT * FORCE_CONFIG.CLUSTER_ALPHA
          ctx.fillStyle = grd
          ctx.beginPath()
          ctx.arc(cc.x, cc.y, FORCE_CONFIG.CLUSTER_RADIUS, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      ctx.globalAlpha = settledT * FORCE_CONFIG.EDGE_ALPHA
      FORCE_EDGES.forEach(([i, j]) => {
        const a = nodes[i],
          b = nodes[j]
        if (!a?.alive || !b?.alive) return
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.strokeStyle =
          a.group === b.group ? FORCE_COLORS[a.group] : '#ffffff'
        ctx.lineWidth = FORCE_CONFIG.EDGE_WIDTH
        ctx.stroke()
      })
      ctx.globalAlpha = 1

      if (settledT < FORCE_CONFIG.NOISE_THRESHOLD) {
        for (
          let f = 0;
          f < Math.floor(Math.random() * FORCE_CONFIG.NOISE_MAX_COUNT);
          f++
        ) {
          const ai = Math.floor(Math.random() * nodes.length)
          const bi = Math.floor(Math.random() * nodes.length)
          const a = nodes[ai],
            b = nodes[bi]
          if (!a?.alive || !b?.alive || ai === bi) continue
          ctx.globalAlpha = Math.random() * FORCE_CONFIG.NOISE_ALPHA
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = FORCE_CONFIG.NOISE_WIDTH
          ctx.setLineDash([3, 6])
          ctx.stroke()
          ctx.setLineDash([])
        }
        ctx.globalAlpha = 1
      }

      for (const n of nodes) {
        if (!n.alive) continue
        const color = FORCE_COLORS[n.group]
        const r = FORCE_CONFIG.NODE_RADIUS
        const grd = ctx.createRadialGradient(
          n.x,
          n.y,
          0,
          n.x,
          n.y,
          r * FORCE_CONFIG.NODE_GLOW_MUL
        )
        grd.addColorStop(0, color + '55')
        grd.addColorStop(1, 'transparent')
        ctx.globalAlpha = 0.8
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(n.x, n.y, r * FORCE_CONFIG.NODE_GLOW_MUL, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        if (settledT > FORCE_CONFIG.LABEL_THRESHOLD) {
          ctx.globalAlpha =
            clamp(
              (settledT - FORCE_CONFIG.LABEL_THRESHOLD) /
                (1 - FORCE_CONFIG.LABEL_THRESHOLD),
              0,
              1
            ) * FORCE_CONFIG.LABEL_ALPHA
          ctx.font = '8.5px "Space Mono", monospace'
          ctx.fillStyle = '#cbd5e1'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.fillText(n.label, n.x, n.y - r - 2)
          ctx.textBaseline = 'alphabetic'
          ctx.globalAlpha = 1
        }
      }

      if (settledT > FORCE_CONFIG.DOMAIN_THRESHOLD) {
        const la = clamp(
          (settledT - FORCE_CONFIG.DOMAIN_THRESHOLD) /
            (1 - FORCE_CONFIG.DOMAIN_THRESHOLD),

          0,

          1
        )

        FORCE_CENTERS.forEach((cc, g) => {
          ctx.globalAlpha = la * FORCE_CONFIG.DOMAIN_ALPHA

          ctx.font = `bold ${FORCE_CONFIG.DOMAIN_FONT_SIZE}px "Space Mono", monospace`

          ctx.fillStyle = FORCE_COLORS[g]

          ctx.textAlign = 'center'

          ctx.textBaseline = 'bottom'

          ctx.fillText(
            FORCE_DOMAINS[g],
            cc.x,
            cc.y - FORCE_CONFIG.DOMAIN_OFFSET
          )

          ctx.textBaseline = 'alphabetic'

          ctx.globalAlpha = 1
        })
      }

      if (!isFinished) {
        rafRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <canvas ref={canvasRef} width={400} height={400} className="w-full block" />
  )
}
