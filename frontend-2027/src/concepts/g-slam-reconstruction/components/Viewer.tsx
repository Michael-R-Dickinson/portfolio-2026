// Fixed full-viewport WebGL viewer: reconstruction + trajectory + scroll-driven camera rig.
// Also projects keyframe positions to screen for the DOM labels (no drei <Html>).
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { SCENE_FOCUS } from '../scene/fieldScene'
import { KEYFRAMES, liveIndex, poseAt } from '../scene/trajectory'
import { PALETTE, clamp01, dom, slam, smooth, stats } from '../state'
import { ReconstructionCloud } from './ReconstructionCloud'
import { Trajectory } from './Trajectory'

const focus = new THREE.Vector3(...SCENE_FOCUS)
const camGoal = new THREE.Vector3()
const lookGoal = new THREE.Vector3()
const ovCam = new THREE.Vector3()
const ovLook = new THREE.Vector3()
const tlCam = new THREE.Vector3()
const tlLook = new THREE.Vector3()
const livePos = new THREE.Vector3()
const liveQuat = new THREE.Quaternion()
const out = new THREE.Vector3()
const ahead = new THREE.Vector3()
const proj = new THREE.Vector3()
const fwd = new THREE.Vector3()
const toK = new THREE.Vector3()

const fmt = (n: number) => n.toLocaleString('en-US')

function Rig({ reduced }: { reduced: boolean }) {
  const look = useRef(new THREE.Vector3())
  const st = useRef({ init: false, t: 0, hudT: 0, shiftX: 0, shiftY: 0 })
  const size = useThree((s) => s.size)

  useFrame(({ camera, clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const s = st.current
    const narrow = size.width < 768
    const r = smooth(slam.recon)
    const tl = smooth(slam.tlBlend)

    // overview orbit: front-right, easing lower and closer as the map densifies
    const drift = reduced ? 0 : Math.sin(clock.elapsedTime * 0.11) * 0.07
    const az = THREE.MathUtils.degToRad(64 - 26 * r) + drift
    const R = (narrow ? 21 : 13) - (narrow ? 3 : 1.6) * r
    const H = (narrow ? 10.5 : 6.4) - 1.2 * r
    ovCam.set(focus.x + Math.cos(az) * R, H, focus.z + Math.sin(az) * R)
    ovLook.set(focus.x, 0.3, focus.z)

    // timeline: chase the live keyframe from just outside + above the trajectory
    poseAt(liveIndex(), livePos, liveQuat)
    out.copy(livePos).sub(focus).setY(0).normalize()
    poseAt(Math.min(KEYFRAMES.length - 1, slam.tlIndex + 0.6), ahead, liveQuat)
    // orbit at altitude on the same side as the live keyframe, so its frustum sits in the
    // foreground with the reconstruction beyond it
    tlCam.copy(focus).addScaledVector(out, narrow ? 15 : 12.5).setY(narrow ? 7.5 : 6.2)
    tlLook.copy(focus).lerp(livePos, 0.4).lerp(ahead, 0.15).setY(0.9)

    const useTl = reduced ? 0 : tl
    camGoal.lerpVectors(ovCam, tlCam, useTl)
    lookGoal.lerpVectors(ovLook, tlLook, useTl)

    if (reduced || !s.init) {
      camera.position.copy(camGoal)
      look.current.copy(lookGoal)
    } else {
      const k = 1 - Math.exp(-dt * 3.5)
      camera.position.lerp(camGoal, k)
      look.current.lerp(lookGoal, k)
    }
    camera.lookAt(look.current)

    // frame the scene beside the copy: right on desktop, upper half on phones
    const pc = camera as THREE.PerspectiveCamera
    const wantX = narrow ? 0 : -0.2 * size.width
    const wantY = narrow ? size.height * (0.3 - 0.2 * clamp01(slam.recon * 2.5)) : 0
    s.shiftX = s.init && !reduced ? THREE.MathUtils.lerp(s.shiftX, wantX, 0.1) : wantX
    s.shiftY = s.init && !reduced ? THREE.MathUtils.lerp(s.shiftY, wantY, 0.1) : wantY
    pc.setViewOffset(size.width, size.height, s.shiftX, s.shiftY, size.width, size.height)
    pc.updateMatrixWorld()
    s.init = true

    // keyframe labels: project to screen, hide behind the camera / outside the timeline
    const els = dom.labels
    {
      camera.getWorldDirection(fwd)
      KEYFRAMES.forEach((k, i) => {
        const el = els[i]
        if (!el) return
        toK.copy(k.position).sub(camera.position)
        const inFront = toK.dot(fwd) > 0.3
        proj.copy(k.position).project(camera)
        const x = (proj.x * 0.5 + 0.5) * size.width
        const y = (-proj.y * 0.5 + 0.5) * size.height
        let vis = inFront && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05 ? tl : 0
        // keep labels clear of the text column: desktop fades them toward the left half,
        // phones only show the active keyframe's label
        if (narrow) vis *= Math.round(slam.tlIndex) === i ? 1 : 0
        else vis *= THREE.MathUtils.smoothstep(x, size.width * 0.46, size.width * 0.54)
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
        el.style.opacity = vis.toFixed(3)
      })
    }

    // HUD readout (~8 Hz; decorative viewer telemetry)
    s.t += dt
    s.hudT += dt
    stats.frame = Math.floor(s.t * 30)
    const h = dom
    if ((s.hudT > 0.12 || !s.init)) {
      s.hudT = 0
      if (h.points) h.points.textContent = fmt(stats.mapPoints)
      if (h.frame) h.frame.textContent = String(1200 + Math.round(slam.recon * 3400 + slam.tlIndex * 180)).padStart(5, '0')
      if (h.kf) h.kf.textContent = `${Math.min(KEYFRAMES.length, Math.round(liveIndex()) + 1)}/${KEYFRAMES.length}`
      if (h.state) h.state.textContent = slam.recon < 0.08 ? 'SPARSE' : slam.recon < 0.97 ? 'DENSIFYING' : 'CONVERGED'
      h.bars.forEach((b, i) => {
        if (b) b.style.transform = `scaleX(${clamp01(slam.recon * 5.2 - i * 0.95).toFixed(3)})`
      })
    }
  })
  return null
}

export function Viewer({ reduced, budget }: { reduced: boolean; budget: number }) {
  return (
    <Canvas
      className="g-canvas"
      dpr={[1, 1.75]}
      camera={{ fov: 38, near: 0.1, far: 90, position: [9, 6, 10] }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => gl.setClearColor(PALETTE.bg)}
    >
      <ReconstructionCloud
        budget={budget}
        still={reduced}
        getProgress={() => slam.recon}
        onStats={(v, t) => {
          stats.mapPoints = v
          stats.totalPoints = t
        }}
      />
      <Trajectory reduced={reduced} />
      <Rig reduced={reduced} />
    </Canvas>
  )
}
