import { projects, type Project } from '../../content'
import type { DronePartId, Vec3 } from '../../shared/drone'

/** Mutable scroll → scene store. Written by the page's scroll handler, read every frame by the 3D rig. */
export const rig = {
  explode: 0, // 0 assembled … 1 fully exploded (target; the rig damps towards it)
  invalidate: null as null | (() => void), // set by the canvas so demand-mode (reduced motion) can redraw
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
export const smooth = (x: number) => x * x * (3 - 2 * x)

/** Below this width the diagram becomes: sticky drone on top, cards stacked underneath. */
export const STACKED_QUERY = '(max-width: 959px)'

export const PAPER = '#f2f0e9'
export const INK = '#17233d'
export const ACCENT = '#1f4fd8'

const uas = projects.find((p) => p.id === 'uas') as Project
const nexus = projects.find((p) => p.id === 'livenexus') as Project

export type Callout = {
  part: DronePartId
  no: string
  partName: string
  title: string
  source: string
  body: string[]
  tags: string[]
  side: 'left' | 'right'
}

/** The four parts that carry a project. Order = scroll step order. Copy is lifted from content.ts. */
export const CALLOUTS: Callout[] = [
  {
    part: 'radio',
    no: '01',
    partName: 'Telemetry radio',
    title: '10 km telemetry link',
    source: 'UBC UAS · RFD900x',
    body: [uas.highlights[3]],
    tags: ['MAVLink', 'RFD900x', 'C++'],
    side: 'left',
  },
  {
    part: 'flightController',
    no: '02',
    partName: 'Flight controller',
    title: 'ROS2–MAVLink command link',
    source: 'UBC UAS · ArduPilot',
    body: [uas.highlights[2]],
    tags: ['ROS2', 'MAVLink', 'ArduPilot SITL'],
    side: 'right',
  },
  {
    part: 'gimbal',
    no: '03',
    partName: 'Camera gimbal',
    title: 'SLAM + target detection',
    source: 'UBC UAS · RealSense RGB-D',
    body: [uas.highlights[0], uas.highlights[1]],
    tags: ['cuVSLAM', 'YOLO', 'ROS2', 'Jetson'],
    side: 'right',
  },
  {
    part: 'compute',
    no: '04',
    partName: 'Onboard compute (Jetson)',
    title: 'LiveNexus · MUX Lab perception',
    source: 'First-author, submitted to CHI 2027',
    body: [nexus.description, ...nexus.highlights],
    tags: nexus.tags,
    side: 'left',
  },
]

/** Small un-numbered part names drawn next to the remaining parts (desktop only). */
export const MINOR_LABELS: { part: DronePartId; label: string; side?: 'left'; at?: Vec3 }[] = [
  { part: 'props', label: 'Propellers ×4' },
  { part: 'motors', label: 'Brushless motors', side: 'left', at: [-0.78, 0.08, -0.78] },
  { part: 'gps', label: 'GPS mast' },
  { part: 'battery', label: 'LiPo battery', side: 'left', at: [-0.16, -0.12, -0.02] },
  { part: 'landingGear', label: 'Landing gear', side: 'left', at: [-0.47, -0.5, -0.47] },
]

/** Extra per-part travel at full explode, on top of the shared explode directions (keeps callout parts apart on screen). */
export const EXTRA_OFFSETS: Partial<Record<DronePartId, Vec3>> = {
  radio: [0.1, 0.75, 0.1],
  compute: [-1.0, -0.9, -0.8],
  flightController: [0.6, 1.0, 0.6],
  gimbal: [0.3, -0.1, 0.3],
  gps: [0.2, -0.55, 0],
  props: [0, -0.3, 0],
  landingGear: [0, 0.3, 0],
}

/** Projects that are not on the airframe: listed as a bill of materials under the diagram. */
export const BOM: Project[] = projects.filter((p) => !['uas', 'livenexus'].includes(p.id))
