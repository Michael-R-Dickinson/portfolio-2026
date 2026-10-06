/*
 * Procedural competition quadcopter (R3F). No model files, no license, per-part animatable.
 *
 *   <Drone />                                   assembled, props spinning (default)
 *   <Drone explode={0.6} />                     push every part along DRONE_EXPLODE_DIRECTIONS[id] * explode
 *   <Drone partOffsets={{ gps: [0, 1, 0] }} />  extra per-part offset (drone-local units), added on top of explode
 *   <Drone propSpeed={0} />                     props stopped (rad/s; default DEFAULT_PROP_SPEED)
 *   <Drone colors={{ accent: '#38bdf8' }} />    material color overrides (see DroneColors)
 *
 * Any other props (position, rotation, scale, onClick...) go to the root <group>.
 * Each part is a <group name={DronePartId}>, so you can also find it with object.getObjectByName(id).
 *
 * Local frame: +Z = forward (gimbal side), +Y = up. Motor-to-motor diagonal ≈ 2 units,
 * landing gear bottom at y ≈ -0.78, prop plane at y ≈ 0.15.
 * Part ids/labels, explode directions, anchors and default colors live in ./parts.ts.
 * DRONE_PART_ANCHORS gives each part's approximate assembled center (for labels / leader lines).
 */
import { useFrame, type ThreeElements } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import {
  DEFAULT_DRONE_COLORS,
  DEFAULT_PROP_SPEED,
  DRONE_EXPLODE_DIRECTIONS,
  type DroneColors,
  type DronePartId,
  type Vec3,
} from './parts'

export type DroneProps = Omit<ThreeElements['group'], 'children'> & {
  explode?: number
  partOffsets?: Partial<Record<DronePartId, Vec3>>
  propSpeed?: number
  colors?: Partial<DroneColors>
}

const R_MOTOR = 1.0
const MOTOR_ANGLES = [0, 1, 2, 3].map((i) => Math.PI / 4 + (i * Math.PI) / 2)
const motorPos = (theta: number, r = R_MOTOR, y = 0): Vec3 => [r * Math.cos(theta), y, -r * Math.sin(theta)]

type Mats = Record<
  'carbon' | 'carbonLight' | 'metal' | 'accent' | 'pcb' | 'strap' | 'prop' | 'lens' | 'black',
  THREE.Material
>

function useMaterials(colors: DroneColors): Mats {
  const mats = useMemo<Mats>(
    () => ({
      carbon: new THREE.MeshStandardMaterial({ color: colors.carbon, roughness: 0.42, metalness: 0.35 }),
      carbonLight: new THREE.MeshStandardMaterial({ color: colors.carbonLight, roughness: 0.5, metalness: 0.4 }),
      metal: new THREE.MeshStandardMaterial({ color: colors.metal, roughness: 0.28, metalness: 0.9 }),
      accent: new THREE.MeshStandardMaterial({ color: colors.accent, roughness: 0.4, metalness: 0.2 }),
      pcb: new THREE.MeshStandardMaterial({ color: colors.pcb, roughness: 0.6, metalness: 0.1 }),
      strap: new THREE.MeshStandardMaterial({ color: colors.strap, roughness: 0.7 }),
      prop: new THREE.MeshStandardMaterial({ color: colors.prop, roughness: 0.35, metalness: 0.2 }),
      lens: new THREE.MeshStandardMaterial({ color: '#0b1730', roughness: 0.05, metalness: 1 }),
      black: new THREE.MeshStandardMaterial({ color: '#08090b', roughness: 0.8 }),
    }),
    [colors.carbon, colors.carbonLight, colors.metal, colors.accent, colors.pcb, colors.strap, colors.prop],
  )
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])
  return mats
}

function useBladeGeometry() {
  const geo = useMemo(() => {
    // Planform of one blade, root at x=0.06 → tip at x=0.6, in XY; extruded thin and laid flat.
    const s = new THREE.Shape()
    s.moveTo(0.05, -0.022)
    s.bezierCurveTo(0.2, -0.05, 0.4, -0.04, 0.6, -0.012)
    s.quadraticCurveTo(0.615, 0, 0.6, 0.01)
    s.bezierCurveTo(0.4, 0.028, 0.2, 0.034, 0.05, 0.02)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false, curveSegments: 8 })
    g.translate(0, 0, -0.004)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  useEffect(() => () => geo.dispose(), [geo])
  return geo
}

function Part({
  id,
  explode,
  offsets,
  children,
}: {
  id: DronePartId
  explode: number
  offsets?: Partial<Record<DronePartId, Vec3>>
  children: ReactNode
}) {
  const d = DRONE_EXPLODE_DIRECTIONS[id]
  const o = offsets?.[id] ?? [0, 0, 0]
  return (
    <group name={id} position={[d[0] * explode + o[0], d[1] * explode + o[1], d[2] * explode + o[2]]}>
      {children}
    </group>
  )
}

export function Drone({
  explode = 0,
  partOffsets,
  propSpeed = DEFAULT_PROP_SPEED,
  colors: colorOverrides,
  ...groupProps
}: DroneProps) {
  const colors = { ...DEFAULT_DRONE_COLORS, ...colorOverrides }
  const m = useMaterials(colors)
  const blade = useBladeGeometry()
  const propRefs = useRef<(THREE.Group | null)[]>([])

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05) * propSpeed
    propRefs.current.forEach((p, i) => {
      if (p) p.rotation.y += i % 2 === 0 ? step : -step
    })
  })

  const P = { explode, offsets: partOffsets }
  const blurOpacity = Math.min(Math.abs(propSpeed) / 60, 1) * 0.14

  return (
    <group {...groupProps}>
      {/* ── Frame: stacked octagonal carbon plates, standoffs, payload cage ── */}
      <Part id="frame" {...P}>
        <mesh material={m.carbon} position={[0, 0.055, 0]} rotation={[0, Math.PI / 8, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.016, 8]} />
        </mesh>
        <mesh material={m.carbon} position={[0, -0.045, 0]} rotation={[0, Math.PI / 8, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.016, 8]} />
        </mesh>
        {MOTOR_ANGLES.map((a, i) => (
          <mesh key={i} material={m.metal} position={motorPos(a + Math.PI / 4, 0.26, 0.005)}>
            <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
          </mesh>
        ))}
        {/* payload cage (the silver plate box under the team's drone) */}
        <group position={[0, -0.2, 0]}>
          {[-1, 1].map((sx) => (
            <mesh key={sx} material={m.metal} position={[sx * 0.2, 0, 0]}>
              <boxGeometry args={[0.008, 0.28, 0.32]} />
            </mesh>
          ))}
          <mesh material={m.metal} position={[0, -0.14, 0]}>
            <boxGeometry args={[0.41, 0.008, 0.32]} />
          </mesh>
        </group>
      </Part>

      {/* ── Arms: carbon tubes with folding clamps and motor mounts ── */}
      <Part id="arms" {...P}>
        {MOTOR_ANGLES.map((a, i) => (
          <group key={i} rotation={[0, a, 0]}>
            <mesh material={m.carbon} position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.84, 12]} />
            </mesh>
            <mesh material={m.metal} position={[0.33, 0, 0]}>
              <boxGeometry args={[0.09, 0.075, 0.08]} />
            </mesh>
            <mesh material={m.black} position={[0.33, 0.045, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.03, 8]} />
            </mesh>
            <mesh material={m.carbonLight} position={[R_MOTOR, -0.005, 0]}>
              <boxGeometry args={[0.13, 0.05, 0.1]} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Motors: stator + bell with machined cap ── */}
      <Part id="motors" {...P}>
        {MOTOR_ANGLES.map((a, i) => (
          <group key={i} position={motorPos(a)}>
            <mesh material={m.carbonLight} position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.04, 20]} />
            </mesh>
            <mesh material={m.black} position={[0, 0.085, 0]} castShadow>
              <cylinderGeometry args={[0.078, 0.078, 0.05, 24]} />
            </mesh>
            <mesh material={m.metal} position={[0, 0.113, 0]}>
              <cylinderGeometry args={[0.06, 0.07, 0.008, 24]} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Props: two-blade folding props + motion-blur disc ── */}
      <Part id="props" {...P}>
        {MOTOR_ANGLES.map((a, i) => (
          <group key={i} position={motorPos(a, R_MOTOR, 0.135)}>
            <group ref={(el) => void (propRefs.current[i] = el)} rotation={[0, i * 0.9, 0]}>
              <mesh material={m.metal}>
                <cylinderGeometry args={[0.035, 0.04, 0.03, 16]} />
              </mesh>
              {[0, Math.PI].map((r) => (
                <group key={r} rotation={[0, r, 0]}>
                  <mesh
                    geometry={blade}
                    material={m.prop}
                    rotation={[(i % 2 === 0 ? 1 : -1) * 0.14, 0, 0]}
                    castShadow
                  />
                  <mesh material={m.metal} position={[0.055, 0, 0]}>
                    <boxGeometry args={[0.03, 0.02, 0.05]} />
                  </mesh>
                </group>
              ))}
            </group>
            {blurOpacity > 0.01 && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
                <ringGeometry args={[0.07, 0.6, 40]} />
                <meshBasicMaterial
                  color="#9aa3ad"
                  transparent
                  opacity={blurOpacity}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        ))}
      </Part>

      {/* ── Landing gear: tall carbon legs with red bands and feet (as on the team aircraft) ── */}
      <Part id="landingGear" {...P}>
        {MOTOR_ANGLES.map((a, i) => (
          <group key={i} position={motorPos(a, 0.66)}>
            <mesh material={m.metal} position={[0, -0.03, 0]}>
              <boxGeometry args={[0.06, 0.03, 0.06]} />
            </mesh>
            <mesh material={m.carbon} position={[0, -0.4, 0]} castShadow>
              <cylinderGeometry args={[0.017, 0.017, 0.74, 8]} />
            </mesh>
            <mesh material={m.strap} position={[0, -0.56, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.07, 8]} />
            </mesh>
            <mesh material={m.black} position={[0, -0.77, 0]}>
              <sphereGeometry args={[0.03, 10, 8]} />
            </mesh>
          </group>
        ))}
      </Part>

      {/* ── Battery: 6S pack under the stack, strapped ── */}
      <Part id="battery" {...P}>
        <mesh material={m.carbonLight} position={[0, -0.12, -0.02]} castShadow>
          <boxGeometry args={[0.32, 0.1, 0.17]} />
        </mesh>
        <mesh material={m.strap} position={[0.06, -0.12, -0.02]}>
          <boxGeometry args={[0.03, 0.106, 0.176]} />
        </mesh>
        <mesh material={m.strap} position={[-0.08, -0.12, -0.02]}>
          <boxGeometry args={[0.03, 0.106, 0.176]} />
        </mesh>
        <mesh material={m.black} position={[0.17, -0.1, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.04, 6]} />
        </mesh>
      </Part>

      {/* ── Flight controller: orange cube on a carrier board ── */}
      <Part id="flightController" {...P}>
        <mesh material={m.carbonLight} position={[0, 0.072, 0.2]}>
          <boxGeometry args={[0.12, 0.012, 0.1]} />
        </mesh>
        <mesh material={m.accent} position={[0, 0.105, 0.2]} castShadow>
          <boxGeometry args={[0.065, 0.055, 0.065]} />
        </mesh>
        <mesh material={m.black} position={[0, 0.134, 0.2]}>
          <boxGeometry args={[0.04, 0.004, 0.04]} />
        </mesh>
      </Part>

      {/* ── Onboard compute: Jetson module with finned heatsink + fan ── */}
      <Part id="compute" {...P}>
        <group position={[0, 0.07, -0.08]}>
          <mesh material={m.pcb} position={[0, 0.008, 0]}>
            <boxGeometry args={[0.2, 0.012, 0.14]} />
          </mesh>
          <mesh material={m.metal} position={[0, 0.03, 0]}>
            <boxGeometry args={[0.12, 0.012, 0.1]} />
          </mesh>
          {Array.from({ length: 7 }, (_, k) => (
            <mesh key={k} material={m.metal} position={[-0.054 + k * 0.018, 0.055, 0]}>
              <boxGeometry args={[0.005, 0.04, 0.1]} />
            </mesh>
          ))}
          <mesh material={m.black} position={[0, 0.078, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.008, 20]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} material={m.metal} position={[s * 0.085, 0.022, 0.06]}>
              <boxGeometry args={[0.018, 0.016, 0.016]} />
            </mesh>
          ))}
        </group>
      </Part>

      {/* ── Telemetry radio: RFD900x-style box with two whip antennas ── */}
      <Part id="radio" {...P}>
        <group position={[-0.24, 0.075, -0.2]} rotation={[0, Math.PI / 4, 0]}>
          <mesh material={m.metal}>
            <boxGeometry args={[0.07, 0.024, 0.05]} />
          </mesh>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.025, 0.012, -0.02]} rotation={[-0.25, 0, s * 0.35]}>
              <mesh material={m.black} position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.006, 0.008, 0.2, 6]} />
              </mesh>
              <mesh material={m.black} position={[0, 0.2, 0]}>
                <sphereGeometry args={[0.009, 8, 6]} />
              </mesh>
            </group>
          ))}
        </group>
      </Part>

      {/* ── GPS mast: folding pole + puck ── */}
      <Part id="gps" {...P}>
        <group position={[0.16, 0.065, -0.24]}>
          <mesh material={m.metal} position={[0, 0.012, 0]}>
            <boxGeometry args={[0.04, 0.02, 0.04]} />
          </mesh>
          <mesh material={m.carbon} position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
          </mesh>
          <mesh material={m.carbonLight} position={[0, 0.33, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.07, 0.025, 24]} />
          </mesh>
          <mesh material={m.accent} position={[0, 0.344, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.012, 0.025, 3]} />
          </mesh>
        </group>
      </Part>

      {/* ── Gimbal: 2-axis yoke + camera, hanging off the nose ── */}
      <Part id="gimbal" {...P}>
        <group position={[0, -0.07, 0.32]}>
          <mesh material={m.carbonLight} position={[0, 0.01, 0]}>
            <boxGeometry args={[0.1, 0.015, 0.06]} />
          </mesh>
          <mesh material={m.black} position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
          </mesh>
          <group position={[0, -0.1, 0]} rotation={[0.35, 0, 0]}>
            {[-1, 1].map((s) => (
              <mesh key={s} material={m.carbonLight} position={[s * 0.065, 0.03, 0]}>
                <boxGeometry args={[0.012, 0.11, 0.04]} />
              </mesh>
            ))}
            <mesh material={m.carbonLight} position={[0, 0.084, 0]}>
              <boxGeometry args={[0.142, 0.012, 0.04]} />
            </mesh>
            <mesh material={m.black} castShadow>
              <boxGeometry args={[0.11, 0.085, 0.09]} />
            </mesh>
            <mesh material={m.metal} position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.025, 20]} />
            </mesh>
            <mesh material={m.lens} position={[0, 0, 0.068]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.024, 0.024, 0.004, 20]} />
            </mesh>
          </group>
        </group>
      </Part>
    </group>
  )
}
