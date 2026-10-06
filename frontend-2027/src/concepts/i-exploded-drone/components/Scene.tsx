import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import {
  DRONE_EXPLODE_DIRECTIONS,
  DRONE_PART_ANCHORS,
  DRONE_PARTS,
  Drone,
  type DronePartId,
  type Vec3,
} from '../../../shared/drone'
import { ACCENT, CALLOUTS, EXTRA_OFFSETS, INK, MINOR_LABELS, PAPER, rig, smooth } from '../state'

// Light "clay" airframe so the ink edge lines carry the drawing.
const COLORS = {
  carbon: '#d3d6dc',
  carbonLight: '#bcc2cc',
  metal: '#e9ebee',
  accent: ACCENT,
  pcb: '#b4c6bd',
  strap: ACCENT,
  prop: '#c5cad3',
}

const cPaper = new THREE.Color(PAPER)
const cInk = new THREE.Color(INK)
const cAccent = new THREE.Color(ACCENT)
const vRight = new THREE.Vector3()
const vUp = new THREE.Vector3()
const vP = new THREE.Vector3()

type PartStyle = {
  mats: Map<string, { m: THREE.MeshStandardMaterial; base: THREE.Color }>
  line: THREE.LineBasicMaterial
  w: number // -1 dimmed … 0 neutral … 1 focused
}

/**
 * Drawing-style pass over the shared drone (which only exposes whole-drone colours):
 * gives every part its own matte material clones + ink edge lines so one part can be focused and the rest dimmed.
 * Idempotent; cheap to call every frame.
 */
function stylise(root: THREE.Object3D, styles: Map<DronePartId, PartStyle>, edges: Map<string, THREE.EdgesGeometry>) {
  for (const { id } of DRONE_PARTS) {
    const g = root.getObjectByName(id)
    if (!g || g.userData.ciDone === g.children.length) continue
    let st = styles.get(id)
    if (!st) {
      st = { mats: new Map(), line: new THREE.LineBasicMaterial({ color: INK, transparent: true }), w: 0 }
      styles.set(id, st)
    }
    const style = st
    g.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || mesh.userData.ci) return
      mesh.userData.ci = true
      const src = mesh.material
      if (!(src instanceof THREE.MeshStandardMaterial)) return // prop blur disc
      let entry = style.mats.get(src.uuid)
      if (!entry) {
        const m = src.clone()
        m.metalness = 0.05
        m.roughness = 0.9
        m.polygonOffset = true
        m.polygonOffsetFactor = 1
        m.polygonOffsetUnits = 1
        const hsl = { h: 0, s: 0, l: 0 }
        m.color.getHSL(hsl)
        if (hsl.l < 0.1) m.color.set('#4a5368') // the drone's fixed near-black bits → slate
        entry = { m, base: m.color.clone() }
        style.mats.set(src.uuid, entry)
      }
      mesh.material = entry.m
      let eg = edges.get(mesh.geometry.uuid)
      if (!eg) {
        eg = new THREE.EdgesGeometry(mesh.geometry, 20)
        edges.set(mesh.geometry.uuid, eg)
      }
      const ls = new THREE.LineSegments(eg, style.line)
      ls.raycast = () => {}
      mesh.add(ls)
    })
    g.userData.ciDone = g.children.length
  }
}

const partPoint = (id: DronePartId, e: number, out: THREE.Vector3, at?: Vec3) => {
  const a = at ?? DRONE_PART_ANCHORS[id]
  const d = DRONE_EXPLODE_DIRECTIONS[id]
  const o = EXTRA_OFFSETS[id] ?? [0, 0, 0]
  return out.set(a[0] + (d[0] + o[0]) * e, a[1] + (d[1] + o[1]) * e, a[2] + (d[2] + o[2]) * e)
}

type RigProps = {
  reduced: boolean
  focus: DronePartId | null
  stageRef: RefObject<HTMLDivElement | null>
}

function Rig({ reduced, focus, stageRef }: RigProps) {
  const group = useRef<THREE.Group>(null)
  const [explode, setExplode] = useState(0)
  const live = useRef({ e: 0, shown: 0, focus })
  const styles = useRef(new Map<DronePartId, PartStyle>())
  const edges = useRef(new Map<string, THREE.EdgesGeometry>())
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    live.current.focus = focus
    invalidate()
  }, [focus, invalidate])

  useEffect(() => {
    rig.invalidate = invalidate
    const st = styles.current
    const eg = edges.current
    return () => {
      rig.invalidate = null
      st.forEach((s) => {
        s.line.dispose()
        s.mats.forEach(({ m }) => m.dispose())
      })
      eg.forEach((g) => g.dispose())
    }
  }, [invalidate])

  const partOffsets = useMemo(() => {
    const out: Partial<Record<DronePartId, Vec3>> = {}
    for (const [id, o] of Object.entries(EXTRA_OFFSETS) as [DronePartId, Vec3][])
      out[id] = [o[0] * explode, o[1] * explode, o[2] * explode]
    return out
  }, [explode])

  useFrame((state, rawDt) => {
    const g = group.current
    const stage = stageRef.current
    if (!g || !stage) return
    const dt = Math.min(rawDt, 0.05)
    const L = live.current
    const { size, clock } = state
    const camera = state.camera as THREE.OrthographicCamera
    const stacked = size.width < 960

    // explode amount: damped follow of the scroll target (reduced motion: assembled / exploded, no tween)
    const target = reduced ? (rig.explode > 0.4 ? 1 : 0) : rig.explode
    L.e = reduced ? target : THREE.MathUtils.damp(L.e, target, 6, dt)
    if (Math.abs(L.e - target) < 0.0015) L.e = target
    const e = smooth(L.e)
    if (Math.abs(e - L.shown) > 0.002 || (L.e === target && L.shown !== e)) {
      L.shown = e
      setExplode(e)
    }

    // framing: big 3/4 portrait beside the hero copy → centred and zoomed out to fit the exploded stack
    const w = size.width
    const h = size.height
    const zHero = stacked ? Math.min(w / 3.3, h / 2.3) : Math.min(w * 0.17, h * 0.34)
    const zExp = stacked ? Math.min(w / 4.3, h / 4.9) : Math.max(60, Math.min((w - 2 * THREE.MathUtils.clamp(w * 0.24, 250, 330) - 120) / 3.5, (h - 240) / 3.9))
    const zoom = THREE.MathUtils.lerp(zHero, zExp, e)
    const ox = stacked ? 0 : THREE.MathUtils.lerp(w * 0.2, 0, e)
    const oy = stacked ? THREE.MathUtils.lerp(-h * 0.04, h * 0.02, e) : THREE.MathUtils.lerp(0, 46, e)
    camera.zoom = zoom
    camera.updateProjectionMatrix()
    vRight.setFromMatrixColumn(camera.matrixWorld, 0)
    vUp.setFromMatrixColumn(camera.matrixWorld, 1)
    const t = reduced ? 0 : clock.elapsedTime
    const hover = 1 - e * 0.85
    g.position
      .set(0, 0, 0)
      .addScaledVector(vRight, ox / zoom)
      .addScaledVector(vUp, oy / zoom + Math.sin(t * 1.5) * 0.035 * hover)
    g.rotation.set(Math.sin(t * 0.9) * 0.02 * hover, Math.sin(t * 0.35) * 0.22 * hover, 0)
    g.updateMatrixWorld()

    // per-part emphasis
    stylise(g, styles.current, edges.current)
    styles.current.forEach((st, id) => {
      const goal = L.focus && e > 0.5 ? (id === L.focus ? 1 : -1) : 0
      st.w = reduced ? goal : THREE.MathUtils.damp(st.w, goal, 9, dt)
      const dim = Math.max(0, -st.w)
      const hot = Math.max(0, st.w)
      st.mats.forEach(({ m, base }) =>
        m.color
          .copy(base)
          .lerp(cPaper, dim * 0.5)
          .lerp(cAccent, hot * 0.16),
      )
      st.line.color.copy(cInk).lerp(cAccent, hot)
      st.line.opacity = 1 - dim * 0.5
    })

    // DOM overlay: leader lines, part balloons, minor labels (all in stage-local px)
    const sr = stage.getBoundingClientRect()
    stage.style.setProperty('--e', e.toFixed(3))
    const project = (id: DronePartId, at?: Vec3) => {
      partPoint(id, e, vP, at)
      g.localToWorld(vP).project(camera)
      return [(vP.x * 0.5 + 0.5) * w, (-vP.y * 0.5 + 0.5) * h] as const
    }
    for (const c of CALLOUTS) {
      const [x, y] = project(c.part)
      const pt = stage.querySelector<SVGGElement>(`[data-pt="${c.part}"]`)
      pt?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`)
      const lead = stage.querySelector<SVGPathElement>(`[data-lead="${c.part}"]`)
      const card = stacked ? null : document.querySelector<HTMLElement>(`.concept-i [data-card="${c.part}"]`)
      if (!lead || !card) continue
      const cr = card.getBoundingClientRect()
      const left = cr.left + cr.width / 2 < sr.left + x
      const cx = (left ? cr.right : cr.left) - sr.left
      const cy = cr.top - sr.top + 21
      const ex = cx + (left ? 1 : -1) * Math.min(56, Math.abs(x - cx) * 0.35)
      lead.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)}L${ex.toFixed(1)} ${cy.toFixed(1)}L${cx.toFixed(1)} ${cy.toFixed(1)}`)
    }
    if (!stacked)
      for (const m of MINOR_LABELS) {
        const el = stage.querySelector<HTMLElement>(`[data-minor="${m.part}"]`)
        if (!el) continue
        const [x, y] = project(m.part, m.at)
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`
      }
  })

  return (
    <group ref={group}>
      <Drone explode={explode} partOffsets={partOffsets} propSpeed={reduced ? 0 : 42 * (1 - explode)} colors={COLORS} />
    </group>
  )
}

export function Scene({ active, ...rigProps }: RigProps & { active: boolean }) {
  return (
    <Canvas
      orthographic
      flat
      dpr={[1, 1.75]}
      frameloop={rigProps.reduced ? 'demand' : active ? 'always' : 'never'}
      camera={{ position: [-9, 6.4, 11.5], zoom: 120, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <hemisphereLight args={['#ffffff', '#b9c0cc', 2.1]} />
      <directionalLight position={[-6, 12, 6]} intensity={1.5} />
      <directionalLight position={[8, 3, 10]} intensity={0.5} />
      <Rig {...rigProps} />
    </Canvas>
  )
}
