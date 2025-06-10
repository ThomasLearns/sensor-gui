// the projection radius finder is a function that, given a target radius
// in meters of the sensor's beam, will find that same radius projected on the xy plane
// (without the z component)
export function getXYProjectedRadius(
  distance: number,
  theta: number,
  phi: number
): number {
  // get the x and y of the point on the sensor's beam at the
  // specified radius
  const x = distance * Math.cos(theta) * Math.sin(phi)
  const y = distance * Math.sin(theta) * Math.sin(phi)

  // get the radius (ignoring z) to that xy point
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
}
