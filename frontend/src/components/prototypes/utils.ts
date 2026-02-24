export type Mouse = { x: number; y: number } | null

export function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

export function easeOut3(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
