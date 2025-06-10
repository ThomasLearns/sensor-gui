import { ConeGeometry } from 'three'

// unlike other pools, cone geometries are not set up to be
// borrowed and returned, but rather to be used by multiple
// objects at once, so we can avoid creating a new geometry
// for each cone with the same radius
// if you desire having each geometry be in use only by
// one object, you should implement a borrowing system

// a cone and details used to determine if a cone
// meets constraints
const coneGeometries: {
  geometry: ConeGeometry
  radius: number
}[] = []

// get a cone geometry for a given radius
// if a cone with the same radius exists, return it
// otherwise, create a new cone geometry and return it
export function getConeGeometry(radius: number) {
  // get only cones matching the radius constraint
  const matchingGeometries = coneGeometries.filter(
    (cone) => cone.radius === radius
  )
  // if a matching geometry exists, return it
  if (matchingGeometries.length > 0) return matchingGeometries[0].geometry

  // otherwise, create a new cone geometry
  const newCone = {
    geometry: new ConeGeometry(radius, 1),
    radius: radius,
  }
  // put the tip of the cone at the origin
  newCone.geometry.translate(0, -0.5, 0)

  // add the new cone to the list of cone geometries
  coneGeometries.push(newCone)

  // return the new cone geometry
  return newCone.geometry
}
