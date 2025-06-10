import { formatHex, oklch } from 'culori'
import {
  Color,
  ConeGeometry,
  FrontSide,
  Material,
  MeshBasicMaterial,
  SphereGeometry,
} from 'three'
import { Brush, Evaluator } from 'three-bvh-csg'
import { assertUnreachable } from '../../../util/assertUnreachable'
import { getConeGeometry } from './coneGeometryPool'
import { BrushPool, BrushSpecifics } from '../../../types/BrushPool'
import { keys } from '../../../util/keys'

// use the same geometry for all spheres
const sphereGeometry = new SphereGeometry(1)

// all available brushes
const brushEntries: BrushPool = []

// borrow a brush based on the material and configuration
export function borrowBrush(
  materialRef: Material,
  configuration: BrushSpecifics
) {
  // find brushes that are available and match the material and configuration
  const availableBrushes = brushEntries.filter(
    (brushEntry) =>
      brushEntry.available &&
      brushEntry.brush.material == materialRef && // material must match
      keys(configuration).every((key) => brushEntry[key] === configuration[key])
  )

  // borrow the first available brush that matches the configuration if there is one
  if (availableBrushes.length > 0) {
    availableBrushes[0].available = false
    return availableBrushes[0].brush
  }

  // if no available brush matches the configuration, create a new one
  const newBrush: (typeof brushEntries)[number] = {
    available: false,
    ...(() => {
      // create a new brush based on the configuration
      switch (configuration.type) {
        case 'sphere':
          return {
            type: 'sphere',
            brush: new Brush(sphereGeometry, materialRef),
          }
          break
        case 'cone':
          return {
            type: 'cone',
            brush: new Brush(
              getConeGeometry(configuration.radius),
              materialRef
            ),
            radius: configuration.radius,
          }
          break
        default:
          assertUnreachable(configuration)
      }
    })(),
  }

  // track the new brush in the pool
  brushEntries.push(newBrush)

  return newBrush.brush
}

// return a brush to the pool, making it available for reuse
export function releaseBrush(brush: Brush) {
  const returnedEntry = brushEntries.find(
    (sphereBrush) => sphereBrush.brush == brush
  )
  if (returnedEntry === undefined) return
  returnedEntry.available = true
}
