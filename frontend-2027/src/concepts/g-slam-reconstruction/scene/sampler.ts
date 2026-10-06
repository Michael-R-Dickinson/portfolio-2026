// Procedural surface sampler: turns simple primitives (quads, triangles, discs, cylinders,
// cones, ellipsoids) into oriented splats with color + a reveal order.
// Pure and seeded, so the cloud is identical on every load.

export type V3 = [number, number, number]
export type RGB = [number, number, number]

export type Sample = {
  p: V3
  n: V3
  c: RGB
  /** 0..1, how "corner/edge-like" this sample is (edges become SLAM keypoints first) */
  edge: number
}

export type Surface = {
  area: number
  /** relative point density per m² */
  density: number
  /** relative chance of being an early keypoint */
  feature: number
  /** fills `out` with a random sample; return false to reject (e.g. ragged ground edge) */
  sample: (r: () => number, out: Sample) => boolean
}

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// ---- tiny vector helpers -------------------------------------------------
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
export const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2])
export const norm = (a: V3): V3 => mul(a, 1 / (len(a) || 1))
const set = (o: V3, x: number, y: number, z: number) => {
  o[0] = x
  o[1] = y
  o[2] = z
}

/** Any unit vector perpendicular to n. */
export function perp(n: V3): V3 {
  const a: V3 = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]
  return norm(cross(n, a))
}

// ---- value noise (for grass/fabric variation) -----------------------------
function hash2(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
export function noise2(x: number, y: number) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = hash2(ix, iy)
  const b = hash2(ix + 1, iy)
  const c = hash2(ix, iy + 1)
  const d = hash2(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

// ---- primitives ------------------------------------------------------------
type Opts = { density?: number; feature?: number }
type ColorUV = (u: number, v: number, p: V3) => RGB

/** Parallelogram origin + s*eu + t*ev, s,t ∈ [0,1]. Normal = eu × ev. */
export function quad(origin: V3, eu: V3, ev: V3, color: RGB | ColorUV, o: Opts = {}): Surface {
  const n = norm(cross(eu, ev))
  return {
    area: len(cross(eu, ev)),
    density: o.density ?? 1,
    feature: o.feature ?? 1,
    sample(r, out) {
      const s = r()
      const t = r()
      set(out.p, origin[0] + eu[0] * s + ev[0] * t, origin[1] + eu[1] * s + ev[1] * t, origin[2] + eu[2] * s + ev[2] * t)
      set(out.n, n[0], n[1], n[2])
      out.c = typeof color === 'function' ? color(s, t, out.p) : color
      out.edge = Math.max(Math.abs(s - 0.5), Math.abs(t - 0.5)) > 0.45 ? 1 : 0
      return true
    },
  }
}

export function tri(a: V3, b: V3, c: V3, color: RGB, o: Opts = {}): Surface {
  const e1 = sub(b, a)
  const e2 = sub(c, a)
  const cr = cross(e1, e2)
  const n = norm(cr)
  return {
    area: len(cr) / 2,
    density: o.density ?? 1,
    feature: o.feature ?? 1,
    sample(r, out) {
      let u = r()
      let v = r()
      if (u + v > 1) {
        u = 1 - u
        v = 1 - v
      }
      set(out.p, a[0] + e1[0] * u + e2[0] * v, a[1] + e1[1] * u + e2[1] * v, a[2] + e1[2] * u + e2[2] * v)
      set(out.n, n[0], n[1], n[2])
      out.c = color
      out.edge = u < 0.04 || v < 0.04 || u + v > 0.96 ? 1 : 0
      return true
    },
  }
}

/** Axis-aligned box minus its bottom face, rotated by `yaw` around +Y. */
export function box(center: V3, size: V3, color: RGB | ((face: number) => RGB), yaw = 0, o: Opts = {}): Surface[] {
  const [hx, hy, hz] = [size[0] / 2, size[1] / 2, size[2] / 2]
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const R = (v: V3): V3 => [v[0] * cy + v[2] * sy, v[1], -v[0] * sy + v[2] * cy]
  const P = (v: V3): V3 => add(center, R(v))
  const col = (f: number) => (typeof color === 'function' ? color(f) : color)
  return [
    quad(P([-hx, hy, hz]), R([2 * hx, 0, 0]), R([0, 0, -2 * hz]), col(0), o), // top
    quad(P([-hx, -hy, hz]), R([2 * hx, 0, 0]), R([0, 2 * hy, 0]), col(1), o), // +z
    quad(P([hx, -hy, -hz]), R([-2 * hx, 0, 0]), R([0, 2 * hy, 0]), col(2), o), // -z
    quad(P([hx, -hy, hz]), R([0, 0, -2 * hz]), R([0, 2 * hy, 0]), col(3), o), // +x
    quad(P([-hx, -hy, -hz]), R([0, 0, 2 * hz]), R([0, 2 * hy, 0]), col(4), o), // -x
  ]
}

/** Flat disc; color(r01, theta). */
export function disc(center: V3, radius: number, color: RGB | ((x: number, z: number) => RGB), o: Opts = {}): Surface {
  return {
    area: Math.PI * radius * radius,
    density: o.density ?? 1,
    feature: o.feature ?? 1,
    sample(r, out) {
      const rr = Math.sqrt(r()) * radius
      const th = r() * Math.PI * 2
      const x = Math.cos(th) * rr
      const z = Math.sin(th) * rr
      set(out.p, center[0] + x, center[1], center[2] + z)
      set(out.n, 0, 1, 0)
      out.c = typeof color === 'function' ? color(x, z) : color
      out.edge = rr > radius * 0.95 ? 1 : 0
      return true
    },
  }
}

/** Cylinder side (and optional top cap) from `base` along `axis` (length = height). */
export function cylinder(base: V3, axis: V3, radius: number, color: RGB, o: Opts & { cap?: boolean } = {}): Surface[] {
  const h = len(axis)
  const a = norm(axis)
  const u = perp(a)
  const w = cross(a, u)
  const side: Surface = {
    area: 2 * Math.PI * radius * h,
    density: o.density ?? 1,
    feature: o.feature ?? 1,
    sample(r, out) {
      const th = r() * Math.PI * 2
      const t = r()
      const cx = Math.cos(th)
      const sx = Math.sin(th)
      const nn: V3 = [u[0] * cx + w[0] * sx, u[1] * cx + w[1] * sx, u[2] * cx + w[2] * sx]
      set(out.p, base[0] + a[0] * h * t + nn[0] * radius, base[1] + a[1] * h * t + nn[1] * radius, base[2] + a[2] * h * t + nn[2] * radius)
      set(out.n, nn[0], nn[1], nn[2])
      out.c = color
      out.edge = t < 0.05 || t > 0.95 ? 1 : 0
      return true
    },
  }
  if (!o.cap) return [side]
  const top = add(base, axis)
  const cap: Surface = {
    area: Math.PI * radius * radius,
    density: o.density ?? 1,
    feature: o.feature ?? 1,
    sample(r, out) {
      const rr = Math.sqrt(r()) * radius
      const th = r() * Math.PI * 2
      const cx = Math.cos(th) * rr
      const sx = Math.sin(th) * rr
      set(out.p, top[0] + u[0] * cx + w[0] * sx, top[1] + u[1] * cx + w[1] * sx, top[2] + u[2] * cx + w[2] * sx)
      set(out.n, a[0], a[1], a[2])
      out.c = color
      out.edge = rr > radius * 0.9 ? 1 : 0
      return true
    },
  }
  return [side, cap]
}

/** Upright cone (apex up). */
export function cone(base: V3, radius: number, height: number, color: RGB | ((t: number) => RGB), o: Opts = {}): Surface {
  const slant = Math.hypot(radius, height)
  const ny = radius / slant
  const nr = height / slant
  return {
    area: Math.PI * radius * slant,
    density: o.density ?? 1,
    feature: o.feature ?? 1,
    sample(r, out) {
      // area-uniform along the slant: more samples near the base
      const t = 1 - Math.sqrt(r())
      const th = r() * Math.PI * 2
      const rr = radius * (1 - t)
      const cx = Math.cos(th)
      const sx = Math.sin(th)
      set(out.p, base[0] + cx * rr, base[1] + t * height, base[2] + sx * rr)
      set(out.n, cx * nr, ny, sx * nr)
      out.c = typeof color === 'function' ? color(t) : color
      out.edge = t > 0.9 || t < 0.04 ? 1 : 0
      return true
    },
  }
}

export function ellipsoid(center: V3, radii: V3, color: RGB | ((n: V3) => RGB), o: Opts = {}): Surface {
  const [a, b, c] = radii
  // Knud Thomsen's approximation
  const p = 1.6075
  const area = 4 * Math.PI * Math.pow((Math.pow(a * b, p) + Math.pow(a * c, p) + Math.pow(b * c, p)) / 3, 1 / p)
  return {
    area,
    density: o.density ?? 1,
    feature: o.feature ?? 1,
    sample(r, out) {
      const z = r() * 2 - 1
      const th = r() * Math.PI * 2
      const s = Math.sqrt(1 - z * z)
      const d: V3 = [s * Math.cos(th), z, s * Math.sin(th)]
      set(out.p, center[0] + d[0] * a, center[1] + d[1] * b, center[2] + d[2] * c)
      const nn = norm([d[0] / a, d[1] / b, d[2] / c])
      set(out.n, nn[0], nn[1], nn[2])
      out.c = typeof color === 'function' ? color(nn) : color
      out.edge = 0
      return true
    },
  }
}
