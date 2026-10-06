// Concept G shared state: palette, tiny math helpers, and a mutable scroll store.
// The page's scroll handler writes `slam`; the 3D viewer reads it inside useFrame
// (no React re-render per scroll tick).

export const PALETTE = {
  bg: '#06080b',
  ink: '#e7ecef',
  mint: '#7af0c2',
  cyan: '#55c8e6',
  violet: '#8b8dff',
  ghost: '#7b8594',
  // depth ramp used for the sparse "SLAM viewer" phase (near → far)
  depth: ['#eafff6', '#7af0c2', '#2fa7b9', '#4a52c9', '#2a2366'],
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smooth = (x: number) => {
  const t = clamp01(x)
  return t * t * (3 - 2 * t)
}

export type Phase = 'hero' | 'projects' | 'timeline'

/** Written on scroll, read every frame. */
export const slam = {
  /** 0 = sparse keypoints only, 1 = fully reconstructed splats */
  recon: 0,
  /** 0 = overview orbit camera, 1 = camera riding the trajectory */
  tlBlend: 0,
  /** fractional keyframe index along the trajectory (0..n-1) */
  tlIndex: 0,
}

/** Written by the viewer each frame, read by the DOM HUD (direct textContent writes). */
export const stats = {
  mapPoints: 0,
  totalPoints: 0,
  frame: 0,
}

export const kfId = (i: number) => `KF ${String(i + 1).padStart(2, '0')}`

/** DOM nodes the viewer writes to directly each frame (registered via callback refs). */
export type HudEls = {
  points?: HTMLElement | null
  frame?: HTMLElement | null
  kf?: HTMLElement | null
  state?: HTMLElement | null
  bars: (HTMLElement | null)[]
  labels: (HTMLElement | null)[]
}
export const dom: HudEls = { bars: [], labels: [] }
