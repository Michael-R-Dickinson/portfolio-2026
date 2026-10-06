// Data for the procedural drone (see Drone.tsx for the component API).

export type Vec3 = [number, number, number]

export type DronePartId =
  | 'frame'
  | 'arms'
  | 'motors'
  | 'props'
  | 'landingGear'
  | 'battery'
  | 'flightController'
  | 'compute'
  | 'radio'
  | 'gps'
  | 'gimbal'

export const DRONE_PARTS: { id: DronePartId; label: string }[] = [
  { id: 'frame', label: 'Carbon frame' },
  { id: 'arms', label: 'Folding arms' },
  { id: 'motors', label: 'Brushless motors' },
  { id: 'props', label: 'Propellers' },
  { id: 'landingGear', label: 'Landing gear' },
  { id: 'battery', label: 'LiPo battery' },
  { id: 'flightController', label: 'Flight controller' },
  { id: 'compute', label: 'Onboard compute (Jetson)' },
  { id: 'radio', label: 'Telemetry radio' },
  { id: 'gps', label: 'GPS mast' },
  { id: 'gimbal', label: 'Camera gimbal' },
]

/** Direction (and relative distance) each part travels at explode = 1. */
export const DRONE_EXPLODE_DIRECTIONS: Record<DronePartId, Vec3> = {
  frame: [0, 0, 0],
  arms: [0, -0.35, 0],
  motors: [0, 0.55, 0],
  props: [0, 1.25, 0],
  landingGear: [0, -1.1, 0],
  battery: [0, -0.75, -0.9],
  flightController: [0, 0.75, 1.0],
  compute: [0, 1.1, -0.15],
  radio: [-1.25, 0.6, -0.5],
  gps: [0.55, 1.5, -1.0],
  gimbal: [0, -0.6, 1.4],
}

/** Approximate assembled center of each part in drone-local space. */
export const DRONE_PART_ANCHORS: Record<DronePartId, Vec3> = {
  frame: [0, 0, 0],
  arms: [0.5, 0, 0.5],
  motors: [0.71, 0.08, 0.71],
  props: [0.71, 0.15, 0.71],
  landingGear: [0.6, -0.45, 0.6],
  battery: [0, -0.15, -0.02],
  flightController: [0, 0.12, 0.2],
  compute: [0, 0.13, -0.08],
  radio: [-0.22, 0.12, -0.2],
  gps: [0.16, 0.42, -0.24],
  gimbal: [0, -0.2, 0.32],
}

export type DroneColors = {
  carbon: string
  carbonLight: string
  metal: string
  accent: string // flight controller / highlights
  pcb: string
  strap: string // battery strap + leg bands
  prop: string
}

export const DEFAULT_DRONE_COLORS: DroneColors = {
  carbon: '#15181d',
  carbonLight: '#2b3038',
  metal: '#a7aeb8',
  accent: '#f08a24',
  pcb: '#1d5a43',
  strap: '#c0392b',
  prop: '#121417',
}

export const DEFAULT_PROP_SPEED = 38
