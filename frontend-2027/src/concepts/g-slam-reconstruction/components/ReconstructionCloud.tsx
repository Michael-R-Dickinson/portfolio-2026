// ─────────────────────────────────────────────────────────────────────────────
// THE SWAPPABLE SCENE.
//
// Everything else in concept G (camera rig, trajectory, HUD, page) only talks to the
// reconstruction through `ReconstructionProps` below plus SCENE_FOCUS / SCENE_RADIUS
// from scene/fieldScene.ts.
//
// Today this renders a procedural, stylized "capture" as one instanced draw call of
// oriented Gaussian-ish splats (custom shader, alpha-to-coverage so no sorting needed).
//
// To drop in a real 3D Gaussian Splatting capture later (e.g. a LiveNexus / MUX Lab scan):
//   1. Write <SplatCapture {...ReconstructionProps} /> around a web splat viewer
//      (drei's <Splat src="…/scene.splat" /> or @mkkellogg/gaussian-splats-3d).
//   2. Map `getProgress()` (0 → 1) onto the reveal: e.g. show splats whose opacity/
//      scale-rank is below a moving threshold, or fade from a sparse COLMAP/RTAB-Map
//      point cloud into the splats.
//   3. Report counts through `onStats` so the HUD stays live.
//   4. Update SCENE_FOCUS / SCENE_RADIUS (and the trajectory radius) to the capture's bounds.
// ─────────────────────────────────────────────────────────────────────────────
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { buildCloud, KEYPOINT_FRACTION, SCENE_FOCUS } from '../scene/fieldScene'
import { PALETTE } from '../state'

export type ReconstructionProps = {
  /** Read every frame. 0 = sparse SLAM keypoints only, 1 = fully reconstructed scene. */
  getProgress: () => number
  /** Splat budget hint; the procedural scene samples this many points. */
  budget: number
  /** Freeze shimmer/twinkle (prefers-reduced-motion). */
  still?: boolean
  /** Called each frame with (visible, total) splat counts for the HUD. */
  onStats?: (visible: number, total: number) => void
}

const REVEAL_WINDOW = 0.08
const FOCUS = new THREE.Vector3(...SCENE_FOCUS)

const vert = /* glsl */ `
  attribute vec3 iPos;
  attribute vec3 iA;
  attribute vec3 iB;
  attribute vec3 iColor;
  attribute vec2 iMeta;
  uniform float uRecon;
  uniform float uTime;
  uniform float uViewH;
  uniform vec3 uRamp[5];
  uniform vec3 uBg;
  uniform float uMid; // camera → scene-centre distance, so the depth ramp adapts to framing
  varying vec2 vUv;
  varying vec3 vCol;
  varying float vSplat;
  varying float vKey;

  const float KEY = ${KEYPOINT_FRACTION.toFixed(4)};
  const float WIN = ${REVEAL_WINDOW.toFixed(3)};

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  vec3 ramp(float t) {
    t = clamp(t, 0.0, 1.0) * 4.0;
    if (t < 1.0) return mix(uRamp[0], uRamp[1], t);
    if (t < 2.0) return mix(uRamp[1], uRamp[2], t - 1.0);
    if (t < 3.0) return mix(uRamp[2], uRamp[3], t - 2.0);
    return mix(uRamp[3], uRamp[4], t - 3.0);
  }

  void main() {
    float order = iMeta.x;
    float seed = iMeta.y;
    bool isKey = order < KEY;
    float frontier = mix(KEY, 1.0 + WIN, uRecon);
    float appear = isKey ? 1.0 : clamp((frontier - order) / WIN, 0.0, 1.0);
    if (appear <= 0.0) {
      // not integrated yet: collapse outside the clip volume (no fragments)
      gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
      return;
    }
    float conv = smoothstep(0.0, 1.0, appear);

    // newly triangulated points start uncertain and converge onto the surface
    vec3 jit = vec3(hash(seed * 91.7), hash(seed * 13.3), hash(seed * 57.1)) - 0.5;
    vec3 center = iPos + jit * 0.6 * (1.0 - conv);
    vec4 mv = modelViewMatrix * vec4(center, 1.0);
    float depth = -mv.z;

    // world size of one screen pixel at this depth
    float px = 2.0 * depth / (projectionMatrix[1][1] * uViewH);
    float grow = smoothstep(0.22, 0.92, uRecon) * conv;

    // sparse phase: constant-pixel dots. dense phase: surface-aligned ellipses (splats)
    float tw = isKey ? 0.8 + 0.35 * sin(uTime * 2.2 + seed * 60.0) : 1.0;
    float dotPx = mix(isKey ? 2.4 : 1.6, 0.9, grow) * tw;
    vec3 bill = vec3(position.xy * px * dotPx, 0.0);
    vec3 a = mat3(modelViewMatrix) * iA;
    vec3 b = mat3(modelViewMatrix) * iB;
    vec3 splat = (a * position.x + b * position.y) * 2.1 * grow;
    mv.xyz += bill + splat;
    gl_Position = projectionMatrix * mv;

    vUv = position.xy;
    vSplat = grow;
    vKey = isKey ? 1.0 : 0.0;

    vec3 depthCol = ramp((depth - uMid + 7.0) / 15.0);
    float rgb = smoothstep(0.3, 0.88, uRecon) * conv;
    vec3 col = mix(depthCol, iColor, rgb);
    col = mix(col, vec3(0.85, 1.0, 0.93), (1.0 - conv) * 0.8); // integration flash
    col = mix(col, uBg, smoothstep(uMid + 4.0, uMid + 20.0, depth) * 0.7);   // fade into the void
    vCol = col;
  }
`

const frag = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vCol;
  varying float vSplat;
  varying float vKey;
  void main() {
    float r2 = dot(vUv, vUv);
    if (r2 > 1.0) discard;
    float dotA = 1.0 - smoothstep(0.45, 1.0, r2);
    float gauss = exp(-r2 * 2.6);
    float a = mix(dotA, gauss, vSplat);
    if (a < 0.08) discard;
    gl_FragColor = vec4(vCol, a);
  }
`

export function ReconstructionCloud({ getProgress, budget, still, onStats }: ReconstructionProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)

  const cloud = useMemo(() => buildCloud(budget), [budget])
  // sorted reveal orders let us count visible splats in O(log n)
  const sortedOrder = useMemo(() => {
    const o = new Float32Array(cloud.count)
    for (let i = 0; i < cloud.count; i++) o[i] = cloud.meta[i * 2]
    return o.sort()
  }, [cloud])

  const geometry = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3))
    g.setIndex([0, 1, 2, 0, 2, 3])
    g.setAttribute('iPos', new THREE.InstancedBufferAttribute(cloud.position, 3))
    g.setAttribute('iA', new THREE.InstancedBufferAttribute(cloud.axisA, 3))
    g.setAttribute('iB', new THREE.InstancedBufferAttribute(cloud.axisB, 3))
    g.setAttribute('iColor', new THREE.InstancedBufferAttribute(cloud.color, 3))
    g.setAttribute('iMeta', new THREE.InstancedBufferAttribute(cloud.meta, 2))
    g.instanceCount = cloud.count
    return g
  }, [cloud])
  useEffect(() => () => geometry.dispose(), [geometry])

  const uniforms = useMemo(
    () => ({
      uRecon: { value: 0 },
      uTime: { value: 0 },
      uViewH: { value: 800 },
      uRamp: { value: PALETTE.depth.map((h) => new THREE.Color(h)) },
      uBg: { value: new THREE.Color(PALETTE.bg) },
      uMid: { value: 14 },
    }),
    [],
  )

  useFrame(({ camera }, dt) => {
    const m = matRef.current
    if (!m) return
    const p = getProgress()
    m.uniforms.uRecon.value = p
    if (!still) m.uniforms.uTime.value += Math.min(dt, 0.05)
    m.uniforms.uViewH.value = size.height * dpr
    m.uniforms.uMid.value = camera.position.distanceTo(FOCUS)
    if (onStats) {
      // visible = keypoints + splats behind the frontier
      const frontier = KEYPOINT_FRACTION + (1 + REVEAL_WINDOW - KEYPOINT_FRACTION) * p - REVEAL_WINDOW * 0.5
      let lo = 0
      let hi = sortedOrder.length
      while (lo < hi) {
        const mid = (lo + hi) >> 1
        if (sortedOrder[mid] < frontier) lo = mid + 1
        else hi = mid
      }
      onStats(Math.max(lo, Math.round(cloud.count * KEYPOINT_FRACTION * 0.9)), cloud.count)
    }
  })

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        alphaToCoverage
        depthWrite
        toneMapped={false}
      />
    </mesh>
  )
}
