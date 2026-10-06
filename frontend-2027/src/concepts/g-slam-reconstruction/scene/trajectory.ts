// Camera trajectory for the timeline: each timeline entry is a keyframe pose on an arc around
// the scene. Past/current entries are "tracked" poses; 'future' entries are predicted poses.
import * as THREE from 'three'
import { timeline } from '../../../content'
import { slam, smooth } from '../state'
import { SCENE_FOCUS } from './fieldScene'

export type Keyframe = {
  id: string
  index: number
  future: boolean
  current: boolean
  position: THREE.Vector3
  target: THREE.Vector3
  quaternion: THREE.Quaternion
}

const focus = new THREE.Vector3(...SCENE_FOCUS)
const RX = 7.0
const RZ = 6.2

// sweep across the open front of the field: left → front → right; future poses continue round the right side
const START = THREE.MathUtils.degToRad(170)
const STEP = THREE.MathUtils.degToRad(-29)

const m = new THREE.Matrix4()
const UP = new THREE.Vector3(0, 1, 0)
export const KEYFRAMES: Keyframe[] = timeline.map((e, i) => {
  const a = START + i * STEP
  const position = new THREE.Vector3(
    focus.x + Math.cos(a) * RX,
    1.7 + 0.45 * Math.sin(i * 1.3) + (e.status === 'future' ? 0.35 : 0),
    focus.z + Math.sin(a) * RZ, // sin(a) > 0 for a ∈ (0°, 180°): the arc passes in front of the scene (+z)
  )
  const target = new THREE.Vector3(focus.x + Math.sin(i * 2.1) * 0.8, 0.3, focus.z + Math.cos(i * 1.7) * 0.8)
  m.lookAt(position, target, UP)
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(m)
  return { id: e.id, index: i, future: e.status === 'future', current: e.status === 'current', position, target, quaternion }
})

/** Index of the last tracked (non-future) keyframe. */
export const LAST_TRACKED = KEYFRAMES.reduce((acc, k) => (k.future ? acc : k.index), 0)

export const TRAJ_CURVE = new THREE.CatmullRomCurve3(
  KEYFRAMES.map((k) => k.position),
  false,
  'centripetal',
)

/** Curve parameter for a (fractional) keyframe index. Keyframes are evenly spaced in angle. */
export const keyT = (i: number) => THREE.MathUtils.clamp(i / (KEYFRAMES.length - 1), 0, 1)

const qA = new THREE.Quaternion()
const qB = new THREE.Quaternion()

/** Pose of the live tracking frustum for a fractional keyframe index. */
export function poseAt(fi: number, pos: THREE.Vector3, quat: THREE.Quaternion) {
  const n = KEYFRAMES.length
  const i = Math.max(0, Math.min(n - 1, fi))
  const i0 = Math.floor(i)
  const i1 = Math.min(n - 1, i0 + 1)
  const f = i - i0
  TRAJ_CURVE.getPoint(keyT(i), pos)
  qA.copy(KEYFRAMES[i0].quaternion)
  qB.copy(KEYFRAMES[i1].quaternion)
  quat.slerpQuaternions(qA, qB, f)
}

/** Fractional keyframe index the live frustum sits at (shared with the camera rig). */
export function liveIndex() {
  const scan = slam.recon * LAST_TRACKED
  return scan + (slam.tlIndex - scan) * smooth(slam.tlBlend)
}

