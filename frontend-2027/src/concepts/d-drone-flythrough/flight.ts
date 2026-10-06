// Flight plan for concept D: terrain height field, timeline waypoints, the flight curve,
// and a tiny mutable scroll store written by the page's scroll handler and read inside useFrame
// (no React state per scroll tick).
import * as THREE from 'three'
import { timeline } from '../../content'

export const PALETTE = {
  zenith: '#070c1a',
  sky: '#252c55',
  horizon: '#c98262',
  sun: '#ffb46b',
  fog: '#3a2f45',
  ground: '#141a28',
  grid: '#ffb054',
  path: '#ffb054',
  future: '#8f9bb8',
  cyan: '#7dd3fc',
}

export const SUN_DIR = new THREE.Vector3(0.55, 0.12, -0.83).normalize()

/** Deterministic low-frequency height field (no noise lib needed). */
export function terrainHeight(x: number, z: number) {
  const rolling =
    1.7 * Math.sin(x * 0.16 + 0.5) * Math.cos(z * 0.13) +
    0.9 * Math.sin(x * 0.37 + z * 0.29) +
    0.4 * Math.cos(x * 0.71 - z * 0.53)
  // mountain range behind the route (toward -z), valley floor in front
  const t = THREE.MathUtils.smoothstep(-z, 10, 34)
  const ridge = t * (5 + 3.2 * Math.sin(x * 0.21) + 2.2 * Math.cos(x * 0.47 + 1.3))
  return rolling + ridge - 1
}

const CRUISE_ALT = 3.4

export const WAYPOINTS: THREE.Vector3[] = timeline.map((_, i) => {
  const x = -16 + i * 4.8
  const z = 4.2 * Math.sin(i * 0.95) - 1
  return new THREE.Vector3(x, terrainHeight(x, z) + CRUISE_ALT, z)
})

export const FLIGHT_CURVE = new THREE.CatmullRomCurve3(WAYPOINTS, false, 'catmullrom', 0.5)

/** Index of the last waypoint that isn't 'future': everything after it is unflown. */
export const LAST_FLOWN = timeline.reduce((acc, e, i) => (e.status === 'future' ? acc : i), 0)

/** Hero hover point and the end of the survey leg flown during the Projects section. */
const w0 = WAYPOINTS[0]
export const HERO_POINT = new THREE.Vector3(w0.x - 15, terrainHeight(w0.x - 15, w0.z + 9) + 7, w0.z + 9)
export const SURVEY_END = new THREE.Vector3(w0.x - 5, terrainHeight(w0.x - 5, w0.z + 3) + 11, w0.z + 3)

export type Phase = 'hero' | 'projects' | 'timeline'

/** Written by the page on scroll, read every frame by the 3D rig. All values 0..1 except tlIndex. */
export const flight = {
  hero: 0, // 0 at top → 1 after ~one screen
  projects: 0, // progress through the projects section
  tlBlend: 0, // 0 before the timeline → 1 once it's in view
  tlIndex: 0, // fractional waypoint index (0..n-1) aligned with the card at viewport center
}

export const smooth = (t: number) => t * t * (3 - 2 * t)
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
