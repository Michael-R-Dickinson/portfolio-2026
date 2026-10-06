// Camera trajectory overlay: tracked path (solid) + predicted path (dashed), one frustum per
// timeline keyframe (future ones hollow + dashed), a live "tracking" frustum, and faint
// covisibility rays from it to scene landmarks.
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { sampleLandmarks } from '../scene/fieldScene'
import { KEYFRAMES, LAST_TRACKED, TRAJ_CURVE, keyT, liveIndex, poseAt } from '../scene/trajectory'
import { PALETTE, slam, smooth } from '../state'

const FW = 0.3
const FH = 0.22
const FD = 0.38

/** Frustum wireframe in camera space (looking down −Z), as line-segment pairs. */
function frustumSegments(scale = 1): number[] {
  const w = FW * scale
  const h = FH * scale
  const d = FD * scale
  const c = [
    [-w, -h, -d],
    [w, -h, -d],
    [w, h, -d],
    [-w, h, -d],
  ]
  const s: number[] = []
  const seg = (a: number[], b: number[]) => s.push(...a, ...b)
  for (const p of c) seg([0, 0, 0], p)
  for (let i = 0; i < 4; i++) seg(c[i], c[(i + 1) % 4])
  // "up" tick so orientation reads at a glance
  seg([-w * 0.35, h, -d], [0, h * 1.45, -d])
  seg([0, h * 1.45, -d], [w * 0.35, h, -d])
  return s
}

const tmpM = new THREE.Matrix4()
const tmpV = new THREE.Vector3()
const ONE = new THREE.Vector3(1, 1, 1)

function keyframeLines(future: boolean) {
  const local = frustumSegments()
  const pts: number[] = []
  for (const k of KEYFRAMES) {
    if (k.future !== future) continue
    tmpM.compose(k.position, k.quaternion, ONE)
    for (let i = 0; i < local.length; i += 3) {
      tmpV.set(local[i], local[i + 1], local[i + 2]).applyMatrix4(tmpM)
      pts.push(tmpV.x, tmpV.y, tmpV.z)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return g
}

function pathGeometry(t0: number, t1: number, n: number) {
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= n; i++) pts.push(TRAJ_CURVE.getPoint(t0 + ((t1 - t0) * i) / n))
  return new THREE.BufferGeometry().setFromPoints(pts)
}

const N_RAYS = 28

export function Trajectory({ reduced }: { reduced: boolean }) {
  const live = useRef<THREE.Group>(null)
  const rays = useRef<THREE.LineSegments>(null)
  const pastMat = useRef<THREE.LineBasicMaterial>(null)
  const rayMat = useRef<THREE.LineBasicMaterial>(null)
  const liveSolid = useRef<THREE.LineSegments>(null)
  const liveDashed = useRef<THREE.LineSegments>(null)
  const planeMat = useRef<THREE.MeshBasicMaterial>(null)

  const geo = useMemo(() => {
    const past = keyframeLines(false)
    const future = new THREE.LineSegments(keyframeLines(true)).computeLineDistances().geometry
    const tracked = pathGeometry(0, keyT(LAST_TRACKED), 120)
    const predicted = pathGeometry(keyT(LAST_TRACKED), 1, 80)
    const liveF = new THREE.BufferGeometry()
    liveF.setAttribute('position', new THREE.Float32BufferAttribute(frustumSegments(1.35), 3))
    new THREE.LineSegments(liveF).computeLineDistances() // adds lineDistance for the dashed (predicted) variant
    const plane = new THREE.PlaneGeometry(FW * 2 * 1.35, FH * 2 * 1.35).translate(0, 0, -FD * 1.35)
    const landmarks = sampleLandmarks(N_RAYS)
    const rayPos = new Float32Array(N_RAYS * 6)
    landmarks.forEach((p, i) => rayPos.set(p, i * 6 + 3))
    const ray = new THREE.BufferGeometry()
    ray.setAttribute('position', new THREE.BufferAttribute(rayPos, 3))
    // small dots for every tracked (non-key) frame along the path
    const dots = pathGeometry(0, keyT(LAST_TRACKED), 44)
    return { past, future, tracked, predicted, liveF, plane, ray, dots }
  }, [])
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo])

  // <line> collides with the SVG JSX element, so the two path polylines are built as objects
  const lines = useMemo(
    () => ({ tracked: new THREE.Line(geo.tracked), predicted: new THREE.Line(geo.predicted).computeLineDistances() }),
    [geo],
  )
  const pathMat = useRef<THREE.LineBasicMaterial>(null)

  const pos = useRef(new THREE.Vector3())
  const quat = useRef(new THREE.Quaternion())

  useFrame(() => {
    const g = live.current
    if (!g) return
    const li = liveIndex()
    poseAt(li, pos.current, quat.current)
    // a predicted (future) pose: dashed ghost frustum instead of the solid tracking one
    const predicted = Math.round(li) > LAST_TRACKED
    if (liveSolid.current) liveSolid.current.visible = !predicted
    if (liveDashed.current) liveDashed.current.visible = predicted
    if (planeMat.current) planeMat.current.color.set(predicted ? PALETTE.ghost : PALETTE.mint)
    g.position.copy(pos.current)
    g.quaternion.copy(quat.current)
    // rays: strongest while sparse, faint once the map is dense
    const r = rays.current
    if (r) {
      const a = r.geometry.getAttribute('position') as THREE.BufferAttribute
      const arr = a.array as Float32Array
      for (let i = 0; i < N_RAYS; i++) arr.set([pos.current.x, pos.current.y, pos.current.z], i * 6)
      a.needsUpdate = true
    }
    const tl = smooth(slam.tlBlend)
    if (rayMat.current) rayMat.current.opacity = 0.13 * (1 - slam.recon * 0.7) * (1 - tl * 0.5)
    if (pastMat.current) pastMat.current.opacity = 0.35 + 0.55 * tl + 0.2 * (1 - slam.recon)
    if (pathMat.current) pathMat.current.opacity = 0.45 + 0.5 * tl
  })

  return (
    <group>
      <lineSegments geometry={geo.past}>
        <lineBasicMaterial ref={pastMat} color={PALETTE.mint} transparent opacity={0.6} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={geo.future}>
        <lineDashedMaterial color={PALETTE.ghost} dashSize={0.05} gapSize={0.045} transparent opacity={0.85} depthWrite={false} />
      </lineSegments>
      <primitive object={lines.tracked}>
        <lineBasicMaterial ref={pathMat} attach="material" color={PALETTE.mint} transparent opacity={0.6} depthWrite={false} />
      </primitive>
      <primitive object={lines.predicted}>
        <lineDashedMaterial attach="material" color={PALETTE.ghost} dashSize={0.14} gapSize={0.12} transparent opacity={0.9} depthWrite={false} />
      </primitive>
      <points geometry={geo.dots}>
        <pointsMaterial color={PALETTE.mint} size={3} sizeAttenuation={false} transparent opacity={0.7} depthWrite={false} />
      </points>
      <lineSegments ref={rays} geometry={geo.ray} frustumCulled={false}>
        <lineBasicMaterial ref={rayMat} color={PALETTE.cyan} transparent opacity={0.2} depthWrite={false} />
      </lineSegments>
      <group ref={live}>
        <lineSegments ref={liveSolid} geometry={geo.liveF}>
          <lineBasicMaterial color="#ffffff" transparent opacity={0.95} depthWrite={false} />
        </lineSegments>
        <lineSegments ref={liveDashed} geometry={geo.liveF} visible={false}>
          <lineDashedMaterial color="#c3cad3" dashSize={0.06} gapSize={0.05} transparent opacity={0.95} depthWrite={false} />
        </lineSegments>
        <mesh geometry={geo.plane}>
          <meshBasicMaterial ref={planeMat} color={PALETTE.mint} transparent opacity={reduced ? 0.14 : 0.18} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}
