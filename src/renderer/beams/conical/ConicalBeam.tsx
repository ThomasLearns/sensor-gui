import {
  Component,
  createEffect,
  createMemo,
  on,
  onCleanup,
  onMount,
} from 'solid-js'
import { useContextOrThrow } from '../../../util/useContextOrThrow'
import { Quaternion, Vector3 } from 'three'
import { SensorContext } from '../../contexts/SensorContext'
import { metersPerFoot } from '../../../util/mathConstants'
import { Brush, INTERSECTION } from 'three-bvh-csg'
import { GraphingContext } from '../../contexts/GraphingContext'
import { ConicalPingHandler } from './ConicalPingHandler'
import {
  borrowBrush,
  cvgEvaluator,
  returnSphereBrush,
} from '../../3dRendering/beamBrush'
import { beamMaterial } from '../../3dRendering/materials'

// display a conical beam using a sensor's properties
export const ConicalBeam: Component = () => {
  const graphing = useContextOrThrow(GraphingContext)
  const sensor = useContextOrThrow(SensorContext)

  // the beam is made up of the intersection of a sphere and a cone
  // the sphere uses the sensor's max range as its radius, and the cone
  // uses the sensor's measuring angle as its angle

  // create the sphere, and maintain its position, scale, etc
  // use 1 as the base radius of the sphere so we can scale it to other radiuses easily
  const sphereBrush = borrowBrush(beamMaterial, { type: 'sphere' })
  // const sphereBrush = new Brush(new SphereGeometry(1), beamMaterial)
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
  let coneBrush: Brush

  // get a brush for the cone, borrowing it from the pool
  // this is a seperate memo because we want to run this as little as possible
  const borrowConeBrush = createMemo(() => {
    return borrowBrush(beamMaterial, {
      type: 'cone',
      // use the measuring angle to determine the radius of the cone
      radius: Math.tan((sensor.data.measuringAngle * Math.PI) / 180 / 2),
    })
  })

  // get a brush for the cone (angle), and update it with the sensor's properties
  const getConeBrush = createMemo(() => {
    // get a new brush only if the angle has changed
    coneBrush = borrowConeBrush()

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

    // return inside a wrapper object to force dependents to
    // see the change as a new reference
    return { brush: coneBrush }
  })

  // the beam is formed through intersecting the sphere (range) and cone (angle)
  const beamBrush = new Brush()

  // maintain the beam brush in the scene
  onMount(() => {
    graphing.scene.add(getBeamBrush().brush)
    onCleanup(() => {
      graphing.scene.remove(beamBrush)
      graphing.requestRender()
      returnSphereBrush(coneBrush)
      returnSphereBrush(sphereBrush)
    })
  })

  // create the beam brush by evaluating the intersection of the sphere and cone
  const getBeamBrush = createMemo(() => {
    cvgEvaluator.evaluate(
      getSphereBrush(),
      getConeBrush().brush,
      INTERSECTION,
      beamBrush
    )

    beamBrush.updateMatrixWorld()

    // return inside a wrapper object to force dependents to
    // see the change as a new reference
    return { brush: beamBrush }
  })

  // rerender whenever the beam brush changes
  createEffect(
    on(getBeamBrush, () => {
      // render beam
      graphing.requestRender()
    })
  )

  return (
    <>
      <ConicalPingHandler coneBrush={getConeBrush().brush} />
    </>
  )
}
