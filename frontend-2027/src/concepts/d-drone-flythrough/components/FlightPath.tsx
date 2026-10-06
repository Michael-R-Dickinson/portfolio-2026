import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { timeline } from '../../../content'
import { FLIGHT_CURVE, LAST_FLOWN, PALETTE, WAYPOINTS, flight, terrainHeight, type Phase } from '../flight'

const N = WAYPOINTS.length
const vProj = new THREE.Vector3()

function placeLabel(el: HTMLElement, x: number, y: number, opacity: number, active: boolean) {
  el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`
  el.style.opacity = String(opacity)
  el.dataset.active = String(active)
}

/** Flight path over the terrain: flown leg solid, unflown leg dashed; one marker per timeline entry. */
type Props = { labelsRef?: RefObject<HTMLDivElement | null>; reduced?: boolean; phase?: Phase }

export function FlightPath({ labelsRef, reduced = false, phase = 'hero' }: Props) {
  const { flown, unflown } = useMemo(() => {
    const split = LAST_FLOWN / (N - 1)
    const pts = (a: number, b: number, n: number) =>
      Array.from({ length: n + 1 }, (_, i) => FLIGHT_CURVE.getPoint(a + ((b - a) * i) / n))
    return { flown: pts(0, split, 140), unflown: pts(split, 1, 80) }
  }, [])

  const markerRefs = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock, camera, size }) => {
    // reduced motion: static pose (drone parked at the last flown waypoint once the timeline is reached)
    const active = reduced ? LAST_FLOWN : Math.round(flight.tlIndex)
    const vis = reduced ? (phase === 'timeline' ? 1 : 0) : flight.tlBlend
    markerRefs.current.forEach((g, i) => {
      if (!g) return
      const on = i === active && vis > 0.5
      const s = on ? 1.35 + (reduced ? 0 : Math.sin(clock.elapsedTime * 4) * 0.12) : 1
      g.scale.setScalar(reduced ? s : THREE.MathUtils.lerp(g.scale.x, s, 0.2))
    })
    // DOM labels (rendered by the page) pinned to each waypoint by projecting to screen space
    const labels = labelsRef?.current?.children
    if (!labels) return
    for (let i = 0; i < labels.length; i++) {
      const el = labels[i] as HTMLElement
      vProj.copy(WAYPOINTS[i]).project(camera)
      const behind = vProj.z > 1
      const x = ((vProj.x + 1) / 2) * size.width
      const y = ((1 - vProj.y) / 2) * size.height
      placeLabel(el, x, y - 22, behind ? 0 : vis * (i === active ? 1 : 0.7), i === active)
    }
  })

  return (
    <group>
      <Line points={flown} color={PALETTE.path} lineWidth={2.4} transparent opacity={0.95} />
      <Line
        points={unflown}
        color={PALETTE.future}
        lineWidth={1.6}
        dashed
        dashSize={0.45}
        gapSize={0.35}
        transparent
        opacity={0.85}
      />
      {WAYPOINTS.map((p, i) => {
        const entry = timeline[i]
        const future = entry.status === 'future'
        const gy = terrainHeight(p.x, p.z) + 0.04
        const color = future ? PALETTE.future : PALETTE.path
        return (
          <group key={entry.id}>
            {/* ground footprint */}
            <mesh position={[p.x, gy, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.42, 0.5, 32]} />
              <meshBasicMaterial color={color} transparent opacity={future ? 0.45 : 0.8} depthWrite={false} />
            </mesh>
            {/* plumb line from ground to path */}
            <Line
              points={[
                [p.x, gy, p.z],
                [p.x, p.y, p.z],
              ]}
              color={color}
              lineWidth={1}
              dashed
              dashSize={0.12}
              gapSize={0.12}
              transparent
              opacity={0.5}
            />
            {/* waypoint on the path: filled dot = flown, hollow ring = not yet flown */}
            <group position={p} ref={(el) => void (markerRefs.current[i] = el)}>
              {future ? (
                <mesh>
                  <torusGeometry args={[0.13, 0.025, 8, 24]} />
                  <meshBasicMaterial color={color} />
                </mesh>
              ) : (
                <mesh>
                  <sphereGeometry args={[0.09, 14, 10]} />
                  <meshBasicMaterial color={color} />
                </mesh>
              )}
            </group>
            {!future && (
              <mesh position={[p.x, gy + 0.01, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.3, 28]} />
                <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
