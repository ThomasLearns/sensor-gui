export type ConicalPingInput = {
  position: { x: number; y: number }
  outerRadius: number
  innerRadius: number
  quaternion: { qx: number; qy: number; qz: number; qw: number }
}

export type ConicalPingOutput = {
  positions: Float32Array
  normals?: Float32Array
  indices?: Uint32Array
}
