import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { PALETTE, SUN_DIR, terrainHeight } from '../flight'

/** Gradient sky dome with a low sun glow (cheap shader, no textures). */
export function SkyDome() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          zenith: { value: new THREE.Color(PALETTE.zenith) },
          sky: { value: new THREE.Color(PALETTE.sky) },
          horizon: { value: new THREE.Color(PALETTE.horizon) },
          sun: { value: new THREE.Color(PALETTE.sun) },
          ground: { value: new THREE.Color(PALETTE.fog) },
          sunDir: { value: SUN_DIR },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 zenith; uniform vec3 sky; uniform vec3 horizon; uniform vec3 sun; uniform vec3 ground;
          uniform vec3 sunDir;
          varying vec3 vDir;
          void main() {
            float y = vDir.y;
            vec3 c = mix(horizon, sky, smoothstep(-0.02, 0.28, y));
            c = mix(c, zenith, smoothstep(0.25, 0.8, y));
            c = mix(c, ground, smoothstep(0.0, -0.08, y));
            float s = max(dot(vDir, sunDir), 0.0);
            c += sun * (pow(s, 24.0) * 0.6 + pow(s, 4.0) * 0.18) * smoothstep(-0.1, 0.1, y + 0.05);
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [],
  )
  useEffect(() => () => mat.dispose(), [mat])
  return (
    <mesh material={mat} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[300, 32, 16]} />
    </mesh>
  )
}

/** Low-poly flat-shaded height field with a faint survey grid on top. */
export function Terrain({ segments = 110 }: { segments?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(150, 120, segments, Math.round(segments * 0.8))
    g.rotateX(-Math.PI / 2)
    g.translate(-6, 0, -14)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) pos.setY(i, terrainHeight(pos.getX(i), pos.getZ(i)))
    g.computeVertexNormals()
    return g
  }, [segments])
  useEffect(() => () => geo.dispose(), [geo])

  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial color={PALETTE.ground} roughness={0.95} metalness={0} flatShading />
      </mesh>
      <mesh geometry={geo} position={[0, 0.02, 0]}>
        <meshBasicMaterial color={PALETTE.grid} wireframe transparent opacity={0.07} depthWrite={false} />
      </mesh>
    </group>
  )
}
