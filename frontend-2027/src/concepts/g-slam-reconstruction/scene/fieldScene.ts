// The procedural "capture": a competition field with a drone on a landing pad, the team's
// pop-up tent + ground-station table, a telemetry antenna mast, cases, cones and a treeline.
// Units are metres, +Y up, landing pad at the origin.
import {
  box,
  cone,
  cylinder,
  disc,
  dot,
  ellipsoid,
  hex,
  mulberry32,
  noise2,
  norm,
  perp,
  quad,
  tri,
  type RGB,
  type Sample,
  type Surface,
  type V3,
} from './sampler'

/** Where the viewer should look, and how big the scene is. Swap these with a real capture's bounds. */
export const SCENE_FOCUS: V3 = [-0.6, 0.6, -0.6]
export const SCENE_RADIUS = 8

const SUN = norm([0.45, 0.85, 0.3])

const C = {
  grassA: hex('#4d6e3c'),
  grassB: hex('#6b8a4a'),
  grassDry: hex('#8f8c5a'),
  dirt: hex('#6e5f48'),
  padDark: hex('#2e3238'),
  padOrange: hex('#e8742a'),
  white: hex('#eceff1'),
  droneBody: hex('#22262d'),
  droneArm: hex('#16191e'),
  droneAccent: hex('#2f6fe0'),
  motor: hex('#9aa1aa'),
  prop: hex('#c6ccd4'),
  tentBlue: hex('#2154b8'),
  tentBlueDark: hex('#173d88'),
  metal: hex('#b5bcc4'),
  tableTop: hex('#e4e2dc'),
  laptop: hex('#2a2d33'),
  screen: hex('#7fb8ff'),
  caseBlack: hex('#1c1e22'),
  caseYellow: hex('#d9a521'),
  coneOrange: hex('#f06a2a'),
  pine: hex('#1f3d2b'),
  pineB: hex('#2c5236'),
  trunk: hex('#4a3a2c'),
  leaf: hex('#3a5e34'),
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

// ---- ground ----------------------------------------------------------------
const TENT = { x: -3.9, z: -2.1, h: 1.5, top: 2.0 }

function inShadow(x: number, z: number) {
  // march toward the sun from the ground point and test the tent canopy + drone + table footprints
  const tx = x + (SUN[0] / SUN[1]) * TENT.top
  const tz = z + (SUN[2] / SUN[1]) * TENT.top
  if (Math.abs(tx - TENT.x) < TENT.h && Math.abs(tz - TENT.z) < TENT.h) return 0.5
  const dx = x + (SUN[0] / SUN[1]) * 0.34
  const dz = z + (SUN[2] / SUN[1]) * 0.34
  if (Math.abs(dx) < 0.26 && Math.abs(dz) < 0.2) return 0.55
  return 1
}

const ground: Surface = {
  area: 20 * 17.4,
  density: 1,
  feature: 0.8,
  sample(r, out) {
    const x = -10 + r() * 20
    const z = -9.8 + r() * 17.4
    // ragged elliptical capture boundary, like a real scan
    const e = (x / 9.6) ** 2 + ((z + 1.0) / 8.4) ** 2
    const rag = 0.82 + 0.3 * noise2(x * 0.6 + 3, z * 0.6)
    if (e > rag) return false
    if (x * x + z * z < 1.25 * 1.25) return false // pad covers it
    const n1 = noise2(x * 0.45, z * 0.45)
    const n2 = noise2(x * 2.3 + 11, z * 2.3)
    let c = mix(C.grassA, C.grassB, n1)
    c = mix(c, C.grassDry, Math.max(0, noise2(x * 0.18 + 7, z * 0.22) - 0.55) * 1.6)
    // mown stripes
    const stripe = Math.sin(x * 1.05) > 0 ? 1.06 : 0.94
    // worn dirt path from the tent to the pad
    const t = Math.max(0, Math.min(1, (x - TENT.x) / -TENT.x))
    const pz = TENT.z * (1 - t)
    const dPath = Math.abs(z - pz) + (x < TENT.x || x > 0 ? 9 : 0)
    if (dPath < 0.45) c = mix(c, C.dirt, (1 - dPath / 0.45) * 0.55 * (0.6 + 0.4 * n2))
    const s = stripe * (0.93 + 0.12 * n2) * inShadow(x, z)
    out.p[0] = x
    out.p[1] = (n2 - 0.5) * 0.03
    out.p[2] = z
    out.n[0] = 0
    out.n[1] = 1
    out.n[2] = 0
    out.c = [c[0] * s, c[1] * s, c[2] * s]
    out.edge = n2 > 0.86 ? 1 : 0
    return true
  },
}
// the ground rejects ~30% of samples; report the accepted area so splat sizes come out right
ground.area *= 0.7

// ---- landing pad -------------------------------------------------------------
const pad = disc([0, 0.012, 0], 1.25, (x, z) => {
  const rr = Math.hypot(x, z)
  if (rr > 1.0) return C.padOrange
  if (rr > 0.9 && rr < 0.95) return C.white
  const ax = Math.abs(x)
  const az = Math.abs(z)
  const H = (ax > 0.28 && ax < 0.42 && az < 0.5) || (ax < 0.42 && az < 0.06)
  if (H) return C.white
  const s = inShadow(x, z) < 1 ? 0.55 : 1
  return [C.padDark[0] * s, C.padDark[1] * s, C.padDark[2] * s]
}, { density: 5, feature: 2.5 })

// ---- drone (quad, ~1.1 m span) -------------------------------------------------
function drone(): Surface[] {
  const y = 0.3
  const s: Surface[] = []
  const d = { density: 70, feature: 4 }
  s.push(...box([0, y, 0], [0.42, 0.12, 0.3], (f) => (f === 0 ? C.droneBody : f === 1 ? C.droneAccent : C.droneBody), 0, d))
  s.push(...box([0.02, y + 0.09, 0], [0.26, 0.06, 0.2], C.droneBody, 0, d))
  s.push(...box([0.18, y - 0.1, 0], [0.08, 0.07, 0.08], C.droneArm, 0, d)) // gimbal camera
  s.push(...cylinder([-0.1, y + 0.12, 0], [0, 0.16, 0], 0.012, C.metal, d)) // GPS mast
  s.push(disc([-0.1, y + 0.285, 0], 0.055, C.white, d))
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2
    const dir: V3 = [Math.cos(a), 0, Math.sin(a)]
    const end: V3 = [dir[0] * 0.55, y + 0.03, dir[2] * 0.55]
    s.push(...cylinder([dir[0] * 0.12, y + 0.03, dir[2] * 0.12], [dir[0] * 0.43, 0, dir[2] * 0.43], 0.02, C.droneArm, d))
    s.push(...cylinder([end[0], y + 0.03, end[2]], [0, 0.06, 0], 0.045, C.motor, { ...d, cap: true }))
    s.push(disc([end[0], y + 0.1, end[2]], 0.21, (x, z) => (Math.hypot(x, z) < 0.03 ? C.motor : C.prop), { density: 18, feature: 0.6 }))
  }
  // landing skids
  for (const zz of [-0.15, 0.15]) {
    s.push(...cylinder([-0.26, 0.02, zz], [0.52, 0, 0], 0.012, C.droneArm, d))
    s.push(...cylinder([-0.14, 0.02, zz], [0.02, y - 0.08, 0], 0.01, C.droneArm, d))
    s.push(...cylinder([0.14, 0.02, zz], [-0.02, y - 0.08, 0], 0.01, C.droneArm, d))
  }
  return s
}

// ---- tent + ground station ------------------------------------------------------
function tent(): Surface[] {
  const { x, z, h, top } = TENT
  const s: Surface[] = []
  const corners: V3[] = [
    [x - h, top, z - h],
    [x + h, top, z - h],
    [x + h, top, z + h],
    [x - h, top, z + h],
  ]
  const apex: V3 = [x, top + 0.6, z]
  const o = { density: 3, feature: 1.4 }
  for (let i = 0; i < 4; i++) {
    const a = corners[i]
    const b = corners[(i + 1) % 4]
    // outward-facing roof panel; darker on the side facing away from the sun
    const panel = tri(a, apex, b, C.tentBlue, o)
    const n = norm([(a[0] + b[0]) / 2 - x, 0.9, (a[2] + b[2]) / 2 - z])
    const shade = 0.72 + 0.4 * Math.max(0, dot(n, SUN))
    s.push({ ...panel, sample: (r, out) => (panel.sample(r, out), (out.c = out.c.map((v) => v * shade) as RGB), true) })
    // valance skirt
    s.push(quad([a[0], top - 0.24, a[2]], [b[0] - a[0], 0, b[2] - a[2]], [0, 0.24, 0], C.tentBlueDark, o))
    s.push(...cylinder([a[0], 0, a[2]], [0, top, 0], 0.025, C.metal, o))
  }
  // table + laptops (the ground-control station)
  const ty = 0.74
  s.push(...box([x, ty, z - 0.3], [1.8, 0.04, 0.7], C.tableTop, 0, o))
  for (const [lx, lz] of [
    [-0.8, -0.28],
    [0.8, -0.28],
    [-0.8, 0.28],
    [0.8, 0.28],
  ])
    s.push(...cylinder([x + lx, 0, z - 0.3 + lz], [0, ty, 0], 0.02, C.metal, o))
  const lo = { density: 25, feature: 3 }
  for (const lx of [-0.45, 0.35]) {
    s.push(...box([x + lx, ty + 0.03, z - 0.2], [0.34, 0.02, 0.24], C.laptop, 0, lo))
    s.push(quad([x + lx - 0.17, ty + 0.04, z - 0.32], [0.34, 0, 0], [0, 0.22, -0.06], C.screen, lo))
  }
  s.push(...box([x + 0.05, ty + 0.2, z - 0.55], [0.5, 0.3, 0.03], C.laptop, 0, lo)) // monitor
  s.push(quad([x - 0.2, ty + 0.06, z - 0.535], [0.5, 0, 0], [0, 0.28, 0], hex('#86d6a6'), lo))
  return s
}

function props(): Surface[] {
  const s: Surface[] = []
  const o = { density: 12, feature: 2.5 }
  s.push(...box([2.0, 0.16, 1.3], [0.6, 0.32, 0.42], C.caseBlack, 0.4, o))
  s.push(...box([2.55, 0.14, 0.45], [0.48, 0.28, 0.36], C.caseYellow, -0.2, o))
  s.push(...box([1.95, 0.4, 1.3], [0.36, 0.16, 0.26], C.caseYellow, 0.5, o))
  for (const [cx, cz] of [
    [1.7, -1.6],
    [-1.6, 1.7],
  ]) {
    s.push(cone([cx, 0, cz], 0.13, 0.38, (t) => (t > 0.45 && t < 0.62 ? C.white : C.coneOrange), { density: 30, feature: 3 }))
  }
  // telemetry antenna mast on a tripod
  const m: V3 = [-1.4, 0, -3.6]
  const ao = { density: 30, feature: 3 }
  s.push(...cylinder(m, [0, 2.5, 0], 0.022, C.metal, ao))
  s.push(...box([m[0], 2.3, m[2] + 0.04], [0.08, 0.42, 0.14], C.white, 0.3, ao))
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + 0.3
    s.push(...cylinder([m[0], 1.0, m[2]], [Math.cos(a) * 0.55, -1.0, Math.sin(a) * 0.55], 0.014, C.metal, ao))
  }
  return s
}

function trees(): Surface[] {
  const s: Surface[] = []
  const r = mulberry32(7)
  for (let i = 0; i < 11; i++) {
    const x = -9.5 + i * 1.9 + (r() - 0.5) * 0.8
    const z = -9.2 + (r() - 0.5) * 0.8 + Math.abs(x) * 0.06
    const h = 3.0 + r() * 1.7
    const rad = 1.0 + r() * 0.5
    const col = r() < 0.5 ? C.pine : C.pineB
    if (i % 4 === 2) {
      // a broadleaf tree for variety
      s.push(...cylinder([x, 0, z], [0, h * 0.45, 0], 0.15, C.trunk, { density: 2 }))
      s.push(ellipsoid([x, h * 0.62, z], [rad * 1.3, h * 0.34, rad * 1.2], (n) => mix(C.leaf, C.grassB, Math.max(0, dot(n, SUN)) * 0.5), { density: 0.6, feature: 0.5 }))
    } else {
      s.push(...cylinder([x, 0, z], [0, 0.7, 0], 0.13, C.trunk, { density: 2 }))
      s.push(cone([x, 0.5, z], rad, h, (t) => mix(col, C.grassA, t * 0.35), { density: 0.6, feature: 0.5 }))
    }
  }
  return s
}

export function buildSurfaces(): Surface[] {
  return [ground, pad, ...drone(), ...tent(), ...props(), ...trees()]
}

// ---- cloud builder --------------------------------------------------------------

/** Packed per-splat attributes, ready for an InstancedBufferGeometry. */
export type SplatCloud = {
  count: number
  /** xyz centre */
  position: Float32Array
  /** two scaled tangent axes spanning the splat ellipse */
  axisA: Float32Array
  axisB: Float32Array
  /** sRGB colour */
  color: Float32Array
  /** x: reveal order (0 = first keypoints, 1 = last to integrate), y: per-splat random seed */
  meta: Float32Array
}

/** Fraction of splats that exist as sparse SLAM keypoints before any densification. */
export const KEYPOINT_FRACTION = 0.035

export function buildCloud(target: number, seed = 1): SplatCloud {
  const surfaces = buildSurfaces()
  const r = mulberry32(seed)
  const weight = surfaces.map((s) => s.area * s.density)
  const total = weight.reduce((a, b) => a + b, 0)
  const counts = weight.map((w) => Math.max(4, Math.round((w / total) * target)))
  const count = counts.reduce((a, b) => a + b, 0)

  const position = new Float32Array(count * 3)
  const axisA = new Float32Array(count * 3)
  const axisB = new Float32Array(count * 3)
  const color = new Float32Array(count * 3)
  const meta = new Float32Array(count * 2)
  const out: Sample = { p: [0, 0, 0], n: [0, 1, 0], c: [1, 1, 1], edge: 0 }

  let k = 0
  surfaces.forEach((surf, si) => {
    const n = counts[si]
    // splat radius so that n splats roughly tile the surface
    const base = Math.sqrt(surf.area / n) * 0.95
    const featP = 0.022 * surf.feature
    let guard = 0
    for (let i = 0; i < n && guard < n * 20; guard++) {
      if (!surf.sample(r, out)) continue
      i++
      const nn = out.n
      position.set(out.p, k * 3)
      // random in-plane orientation + anisotropy
      const u0 = perp(nn as V3)
      const w0: V3 = [nn[1] * u0[2] - nn[2] * u0[1], nn[2] * u0[0] - nn[0] * u0[2], nn[0] * u0[1] - nn[1] * u0[0]]
      const th = r() * Math.PI
      const c = Math.cos(th)
      const s = Math.sin(th)
      const sa = base * (0.9 + r() * 0.7)
      const sb = base * (0.45 + r() * 0.45)
      for (let j = 0; j < 3; j++) {
        axisA[k * 3 + j] = (u0[j] * c + w0[j] * s) * sa
        axisB[k * 3 + j] = (-u0[j] * s + w0[j] * c) * sb
      }
      // bake simple sun shading for non-ground surfaces (ground handles its own shadows)
      const lit = si === 0 ? 1 : 0.68 + 0.42 * Math.max(0, dot(nn as V3, SUN))
      const jitter = 0.94 + r() * 0.12
      color[k * 3] = Math.min(1, out.c[0] * lit * jitter)
      color[k * 3 + 1] = Math.min(1, out.c[1] * lit * jitter)
      color[k * 3 + 2] = Math.min(1, out.c[2] * lit * jitter)
      // reveal order: corners/edges become keypoints first; the dense map then grows outward from the pad
      const isKey = r() < featP * (1 + 3 * out.edge)
      const dist = Math.hypot(out.p[0] - SCENE_FOCUS[0], out.p[2] - SCENE_FOCUS[2]) / 11
      const spatial = Math.min(1, dist)
      meta[k * 2] = isKey ? r() * KEYPOINT_FRACTION : KEYPOINT_FRACTION + (1 - KEYPOINT_FRACTION) * (0.35 * r() + 0.65 * spatial)
      meta[k * 2 + 1] = r()
      k++
    }
  })
  return {
    count: k,
    position: position.subarray(0, k * 3),
    axisA: axisA.subarray(0, k * 3),
    axisB: axisB.subarray(0, k * 3),
    color: color.subarray(0, k * 3),
    meta: meta.subarray(0, k * 2),
  }
}

/** A few surface points on the salient objects (drone, pad, tent, mast) used as covisibility-ray targets. */
export function sampleLandmarks(n: number, seed = 3): V3[] {
  const r = mulberry32(seed)
  const salient = [pad, ...drone(), ...tent(), ...props()]
  const out: Sample = { p: [0, 0, 0], n: [0, 1, 0], c: [1, 1, 1], edge: 0 }
  const pts: V3[] = []
  while (pts.length < n) {
    const s = salient[Math.floor(r() * salient.length)]
    if (s.sample(r, out)) pts.push([out.p[0], out.p[1], out.p[2]])
  }
  return pts
}
