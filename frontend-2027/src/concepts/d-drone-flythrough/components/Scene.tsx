import { Environment, Lightformer } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { Drone } from '../../../shared/drone'
import {
  FLIGHT_CURVE,
  HERO_POINT,
  LAST_FLOWN,
  PALETTE,
  SUN_DIR,
  SURVEY_END,
  WAYPOINTS,
  clamp01,
  flight,
  smooth,
  type Phase,
} from '../flight'
import { FlightPath } from './FlightPath'
import { SkyDome, Terrain } from './World'

const N = WAYPOINTS.length
const SURVEY_DIR = SURVEY_END.clone().sub(HERO_POINT).setY(0).normalize()

// scratch vectors (module-level so the frame loop allocates nothing)
const vSurvey = new THREE.Vector3()
const vTarget = new THREE.Vector3()
const vCurve = new THREE.Vector3()
const camHero = new THREE.Vector3()
const lookHero = new THREE.Vector3()
const camFeed = new THREE.Vector3()
const lookFeed = new THREE.Vector3()
const camTl = new THREE.Vector3()
const lookTl = new THREE.Vector3()
const camGoal = new THREE.Vector3()
const lookGoal = new THREE.Vector3()

type Inputs = { hero: number; projects: number; tlBlend: number; tlIndex: number }

/** Pure: scroll inputs → drone target position + camera goal (position, look-at). */
function solve(s: Inputs, narrow: boolean, drone: THREE.Vector3) {
  const b = smooth(clamp01(s.projects))
  const t = smooth(clamp01(s.tlBlend))
  vSurvey.lerpVectors(HERO_POINT, SURVEY_END, b)
  vTarget.lerpVectors(vSurvey, WAYPOINTS[0], t)
  FLIGHT_CURVE.getPoint(THREE.MathUtils.clamp(s.tlIndex / (N - 1), 0, 1), vCurve)
  vTarget.lerp(vCurve, t)

  // hero: close 3/4 portrait. Desktop: drone right of the copy. Phone: drone high, copy below.
  if (narrow) {
    camHero.copy(drone).add({ x: 1.2, y: 1.6, z: 11.5 })
    lookHero.copy(drone).add({ x: 0.2, y: -2.8, z: 0 })
  } else {
    camHero.copy(drone).add({ x: 3.0, y: 0.75, z: 5.2 })
    lookHero.copy(drone).add({ x: -1.9, y: 0.05, z: 0.6 })
  }
  // projects: the drone's own downward camera feed
  camFeed.copy(drone).addScaledVector(SURVEY_DIR, 0.7).add({ x: 0, y: -0.6, z: 0 })
  lookFeed.copy(drone).addScaledVector(SURVEY_DIR, 3.5).add({ x: 0, y: -10, z: 0 })
  // timeline: chase from the south so the route runs left → right
  if (narrow) {
    camTl.copy(drone).add({ x: -1.5, y: 8.5, z: 14 })
    lookTl.copy(drone).add({ x: 0.6, y: -7.5, z: -1 })
  } else {
    camTl.copy(drone).add({ x: -3.5, y: 7, z: 14 })
    lookTl.copy(drone).add({ x: -5.2, y: -1.2, z: -2 })
  }
  const w1 = smooth(clamp01(s.hero))
  camGoal.lerpVectors(camHero, camFeed, w1).lerp(camTl, t)
  lookGoal.lerpVectors(lookHero, lookFeed, w1).lerp(lookTl, t)
  return vTarget
}

const STATIC: Record<Phase, Inputs> = {
  hero: { hero: 0, projects: 0, tlBlend: 0, tlIndex: 0 },
  projects: { hero: 0, projects: 0, tlBlend: 0, tlIndex: 0 },
  timeline: { hero: 1, projects: 1, tlBlend: 1, tlIndex: LAST_FLOWN },
}

type RigProps = { reduced: boolean; phase: Phase; hudRef: RefObject<HTMLElement | null> }

function Rig({ reduced, phase, hudRef }: RigProps) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const look = useRef(new THREE.Vector3())
  const prev = useRef(new THREE.Vector3())
  const state = useRef({ init: false, yaw: -0.6, pitch: 0, roll: 0, hudT: 0, speed: 0 })
  const invalidate = useThree((s) => s.invalidate)
  const narrow = useThree((s) => s.size.width < 720)

  useEffect(() => invalidate(), [phase, narrow, invalidate])

  useFrame(({ camera, clock }, rawDt) => {
    const o = outer.current
    const inn = inner.current
    if (!o || !inn) return
    const dt = Math.min(rawDt, 0.05)
    const st = state.current
    const inputs = reduced ? STATIC[phase] : flight
    const target = solve(inputs, narrow, o.position)
    const snap = reduced || !st.init

    // drone position (damped) + gentle hover bob
    if (snap) {
      o.position.copy(target)
      solve(inputs, narrow, o.position) // camera goals from the snapped position (one-frame renders in reduced mode)
    } else o.position.lerp(target, 1 - Math.exp(-dt * 3.2))
    const bob = reduced ? 0 : Math.sin(clock.elapsedTime * 1.7) * 0.07
    inn.position.y = bob

    // heading/tilt from velocity
    const vel = o.position.clone().sub(prev.current).divideScalar(Math.max(dt, 1e-3))
    prev.current.copy(o.position)
    const horiz = Math.hypot(vel.x, vel.z)
    st.speed = THREE.MathUtils.lerp(st.speed, snap ? 0 : horiz, 0.1)
    const inHero = inputs.tlBlend < 0.05 && inputs.projects < 0.02 && inputs.hero < 0.25
    let yawGoal = st.yaw
    if (horiz > 0.25 && !snap) yawGoal = Math.atan2(vel.x, vel.z)
    else if (inHero || reduced) yawGoal = inputs.tlBlend > 0.5 ? Math.PI / 2 : -0.55
    let dy = yawGoal - st.yaw
    dy = Math.atan2(Math.sin(dy), Math.cos(dy))
    st.yaw += snap ? dy : dy * (1 - Math.exp(-dt * 3))
    st.pitch = THREE.MathUtils.lerp(st.pitch, Math.min(st.speed * 0.05, 0.32), 0.08)
    st.roll = THREE.MathUtils.lerp(st.roll, THREE.MathUtils.clamp(-dy * 0.8, -0.35, 0.35), 0.08)
    o.rotation.y = st.yaw
    inn.rotation.set(reduced ? 0 : st.pitch, 0, reduced ? 0 : st.roll + Math.sin(clock.elapsedTime * 1.1) * 0.015)

    // camera
    if (snap) {
      camera.position.copy(camGoal)
      look.current.copy(lookGoal)
    } else {
      const k = 1 - Math.exp(-dt * 4)
      camera.position.lerp(camGoal, k)
      look.current.lerp(lookGoal, k)
    }
    camera.lookAt(look.current)
    st.init = true

    // telemetry readout (~10 Hz, direct DOM write)
    st.hudT += dt
    const hud = hudRef.current
    if (hud && (st.hudT > 0.1 || snap)) {
      st.hudT = 0
      const alt = (o.position.y + 1) * 12
      const hdg = ((((-st.yaw * 180) / Math.PI + 90) % 360) + 360) % 360
      const wp = Math.min(N, Math.round(inputs.tlIndex) + 1)
      const mode = inputs.tlBlend > 0.5 ? 'AUTO' : inputs.hero > 0.3 ? 'SURVEY' : 'LOITER'
      hud.textContent =
        `${mode.padEnd(6)}  ALT ${alt.toFixed(1).padStart(5, '0')}m  ` +
        `GS ${(st.speed * 3).toFixed(1).padStart(4, '0')}m/s  HDG ${hdg.toFixed(0).padStart(3, '0')}°  ` +
        `WP ${String(wp).padStart(2, '0')}/${String(N).padStart(2, '0')}`
    }
  })

  return (
    <group ref={outer}>
      <group ref={inner}>
        <Drone propSpeed={reduced ? 0 : 42} />
      </group>
    </group>
  )
}

export function Scene({
  reduced,
  phase,
  hudRef,
  labelsRef,
}: RigProps & { labelsRef: RefObject<HTMLDivElement | null> }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ fov: 38, near: 0.1, far: 500, position: [0, 5, 10] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <fog attach="fog" args={[PALETTE.fog, 28, 120]} />
      <SkyDome />
      <hemisphereLight args={['#8ea4d8', '#2a1f22', 1.2]} />
      {/* key light on the hero hover point so the dark carbon airframe reads against the sky */}
      <directionalLight
        position={HERO_POINT.clone().add(new THREE.Vector3(5, 4, 7)).toArray()}
        color="#ffe2c4"
        intensity={2.4}
      />
      <directionalLight position={SUN_DIR.clone().multiplyScalar(50).toArray()} color={PALETTE.sun} intensity={2.4} />
      <directionalLight position={[-20, 12, 25]} color="#9fc2ff" intensity={0.9} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ffd2a8" position={[6, 2, -6]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#9fc2ff" position={[-6, 5, 6]} scale={[6, 6, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#ffffff" position={[0, 8, 0]} scale={4} />
      </Environment>
      <Terrain />
      <FlightPath labelsRef={labelsRef} reduced={reduced} phase={phase} />
      <Rig reduced={reduced} phase={phase} hudRef={hudRef} />
    </Canvas>
  )
}
