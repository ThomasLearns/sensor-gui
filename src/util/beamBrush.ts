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
import { assertUnreachable } from './assertUnreachable'
import Geometries from 'three/src/renderers/common/Geometries.js'

export const beamMaterial = new MeshBasicMaterial({
  color: new Color(
    formatHex(
      oklch(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-secondary')
          .trim()
      )
    )
  ),
  opacity: 0.2,
  transparent: true,
})

const sphereGeometry = new SphereGeometry(1)

type SphereEntry = {
  type: 'sphere'
}

type ConeEntry = {
  type: 'cone'
  radius: number
}

type BrushSpecifics = SphereEntry | ConeEntry

const coneGeometries: {
  geometry: ConeGeometry
  radius: number
}[] = []

const brushEntries: ({
  brush: Brush
  available: boolean
} & BrushSpecifics)[] = []

function getConeGeometry(radius: number) {
  const matchingGeometries = coneGeometries.filter(
    (cone) => cone.radius === radius
  )
  if (matchingGeometries.length > 0) return matchingGeometries[0].geometry

  const newCone = {
    geometry: new ConeGeometry(radius, 1),
    radius: radius,
  }

  newCone.geometry.translate(0, -0.5, 0)

  coneGeometries.push(newCone)

  return newCone.geometry
}

export function borrowBrush(
  materialRef: Material,
  configuration: BrushSpecifics
) {
  const availableBrushes = brushEntries.filter(
    (brushEntry) =>
      brushEntry.available &&
      brushEntry.brush.material == materialRef &&
      (Object.keys(configuration) as (keyof BrushSpecifics)[]).every(
        (key) => brushEntry[key] === configuration[key]
      )
  )
  if (availableBrushes.length > 0) {
    availableBrushes[0].available = false
    return availableBrushes[0].brush
  }

  const newBrush: (typeof brushEntries)[number] = {
    available: false,
    ...(() => {
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
          throw new Error('Reached unreachable code')
      }
    })(),
  }

  brushEntries.push(newBrush)

  // switch (type) {
  //   case 'cone':
  //     newBrush = {
  //       brush: new Brush(sphereGeometry, materialRef),
  //       available: false,
  //       type: type
  //     }
  // }
  // const newBrush = {
  //   brush: new Brush(new SphereGeometry(1), beamMaterial),
  //   available: false,
  // }
  // brushEntries.push(newBrush)
  return newBrush.brush
}

export function returnSphereBrush(brush: Brush) {
  const returnedEntry = brushEntries.find(
    (sphereBrush) => sphereBrush.brush == brush
  )
  if (returnedEntry === undefined) return
  returnedEntry.available = true
}

export const cvgEvaluator = new Evaluator()

// material used for displaying pings
export const pingMaterial = new MeshBasicMaterial({
  color: new Color(
    formatHex(
      oklch(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-accent')
          .trim()
      )
    )
  ),
  // opacity is driven by fadeOut()
  transparent: true,
  // always display the ping in front of anything else
  // (prevents from being occluded by the beam itself)
  depthTest: false,
  depthWrite: false,

  side: FrontSide,
})
