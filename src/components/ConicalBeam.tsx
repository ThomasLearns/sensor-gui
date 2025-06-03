import {
  Component,
  createEffect,
  createMemo,
  onCleanup,
  onMount,
} from 'solid-js'
import { useContextOrThrow } from '../util/useContextOrThrow'
import {
  Color,
  ConeGeometry,
  MeshBasicMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { SensorContext } from '../contexts/SensorContext'
import { metersPerFoot } from '../util/mathConstants'
import { Brush, Evaluator, INTERSECTION } from 'three-bvh-csg'
import { GraphingContext } from '../contexts/GraphingContext'
import { formatHex, oklch } from 'culori'
import { ConicalPingHandler } from './ConicalPingHandler'

// display a conical beam using a sensor's properties
export const ConicalBeam: Component = () => {
  const graphing = useContextOrThrow(GraphingContext)
  const sensor = useContextOrThrow(SensorContext)

  // material to use for beam shapes
  const beamMaterial = new MeshBasicMaterial({
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

  // the beam is made up of the intersection of a sphere and a cone
  // the sphere uses the sensor's max range as its radius, and the cone
  // uses the sensor's measuring angle as its angle

  // create the sphere, and maintain its position, scale, etc
  // use 1 as the base radius of the sphere so we can scale it to other radiuses easily
  const sphereBrush = new Brush(new SphereGeometry(1), beamMaterial)
  const getSphereBrush = createMemo(() => {
    // set the radius by scaling the sphere up (or down)
    sphereBrush.scale.set(
      sensor.data.maxRange / metersPerFoot,
      sensor.data.maxRange / metersPerFoot,
      sensor.data.maxRange / metersPerFoot
    )
    // center the sphere on the sensor (ignore z)
    sphereBrush.position.set(sensor.data.xFeet, sensor.data.yFeet, 0)

    // update and return the brush
    sphereBrush.updateMatrixWorld()
    return sphereBrush
  })

  // create the cone, and maintain its position, scale, etc
  let coneBrush = new Brush()
  const getConeBrush = createMemo(() => {
    // always create a new brush for the cone, because we cannot change the
    // angle after setting it (and the angle is reactive)
    coneBrush = new Brush(
      new ConeGeometry(
        Math.tan((sensor.data.measuringAngle * Math.PI) / 180 / 2),
        1 // use 1 as the starting cone height so its easy to scale
      ),
      beamMaterial
    )

    // move the origin from the center of the cone to the tip of the cone
    coneBrush.geometry.translate(0, -0.5, 0)
    // scale the cone to the maximum range of the sensor
    coneBrush.scale.set(
      sensor.data.maxRange / metersPerFoot,
      sensor.data.maxRange / metersPerFoot,
      sensor.data.maxRange / metersPerFoot
    )
    // move the cone's tip to the sensor (ignore z)
    coneBrush.position.set(sensor.data.xFeet, sensor.data.yFeet, 0)
    // rotate the cone to have the base point in the same direction as the sensor
    coneBrush.quaternion.copy(
      new Quaternion().setFromUnitVectors(
        new Vector3(0, -1, 0),
        new Vector3(
          Math.sin(sensor.calculate.phi()) * Math.cos(sensor.calculate.theta()),
          Math.sin(sensor.calculate.phi()) * Math.sin(sensor.calculate.theta()),
          Math.cos(sensor.calculate.phi())
        ).normalize()
      )
    )

    // update and return the brush
    coneBrush.updateMatrixWorld()
    return coneBrush
  })

  // the beam is formed through intersecting the sphere (range) and cone (angle)
  const evaluator = new Evaluator()
  const beamBrush = new Brush()

  // maintain the beam brush in the scene
  onMount(() => {
    graphing.scene.add(beamBrush)
    onCleanup(() => {
      graphing.scene.remove(beamBrush)
      graphing.requestRender()
    })
  })

  createEffect(() => {
    // intersect sphere and cone
    evaluator.evaluate(
      getSphereBrush(),
      getConeBrush(),
      INTERSECTION,
      beamBrush
    )
    // update brush
    beamBrush.updateMatrixWorld()

    // render beam
    graphing.requestRender()
  })

  return (
    <>
      <ConicalPingHandler coneBrush={getConeBrush()} />
    </>
  )
}
