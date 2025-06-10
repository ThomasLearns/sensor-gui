import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
} from 'solid-js'
import { GraphingContext } from '../../contexts/GraphingContext'
import { useContextOrThrow } from '../../../util/useContextOrThrow'
import { Brush, INTERSECTION, SUBTRACTION } from 'three-bvh-csg'
import { SensorContext } from '../../contexts/SensorContext'
import { metersPerFoot } from '../../../util/mathConstants'
import { clamp } from 'three/src/math/MathUtils.js'
import { borrowBrush, releaseBrush } from '../../3dRendering/pools/brushPool'
import { pingMaterial } from '../../3dRendering/materials'
import { csgEvaluator } from '../../3dRendering/evaluator'

const pingWidth = 0.1 // feet
const fadeDuration = 500 // milliseconds

export const ConicalBeamPing: Component<{
  coneBrush: Brush
  distance: number
  finish: () => unknown
}> = (props) => {
  // get contextual information
  const sensor = useContextOrThrow(SensorContext)
  const graphing = useContextOrThrow(GraphingContext)

  const ownedMaterial = pingMaterial.clone()

  // the outer sphere - the inner sphere forms a thin hollow sphere that
  // we can intersect with the cone to get a ping indicator
  const outerSphereBrush = borrowBrush(ownedMaterial, { type: 'sphere' })
  const innerSphereBrush = borrowBrush(ownedMaterial, { type: 'sphere' })

  // create the brush and mesh for the ping
  let pingBrush: Brush

  onMount(() => {
    // add the ping to the canvas
    graphing.scene.add(getPingBrush().brush)
    onCleanup(() => {
      // cleanup ping
      graphing.scene.remove(pingBrush)

      // return borrowed brushes
      releaseBrush(outerSphereBrush)
      releaseBrush(innerSphereBrush)

      // rerender now that ping is removed
      graphing.requestRender()
    })
  })

  // generate the outer sphere centered on the sensor, with
  // a radius slightly larger than the ping distance
  // console.log('defining getOuterSphereBrush')
  const getOuterSphereBrush = createMemo(() => {
    // scale to be slightly larger than the ping distance
    outerSphereBrush.scale.set(
      Math.min(
        props.distance + pingWidth,
        sensor.data.maxRange / metersPerFoot
      ),
      Math.min(
        props.distance + pingWidth,
        sensor.data.maxRange / metersPerFoot
      ),
      Math.min(props.distance + pingWidth, sensor.data.maxRange / metersPerFoot)
    )
    // move to the sensor
    outerSphereBrush.position.set(sensor.data.xFeet, sensor.data.yFeet, 0)

    // update and return
    outerSphereBrush.updateMatrixWorld()
    return outerSphereBrush
  })

  // generate the inner sphere centered on the sensor, with
  // a radius slightly smaller than the ping distance
  const getInnerSphereBrush = createMemo(() => {
    // scale to be slightly smaller than the ping distance
    innerSphereBrush.scale.set(
      Math.max(props.distance - pingWidth, 0),
      Math.max(props.distance - pingWidth, 0),
      Math.max(props.distance - pingWidth, 0)
    )
    // move to the sensor
    innerSphereBrush.position.set(sensor.data.xFeet, sensor.data.yFeet, 0)

    // update and return
    innerSphereBrush.updateMatrixWorld()
    return innerSphereBrush
  })

  const getRingBrush = createMemo(() => {
    const ring = csgEvaluator.evaluate(
      getOuterSphereBrush(),
      getInnerSphereBrush(),
      SUBTRACTION
    )
    return ring
  })

  // fade the ping out over time
  let [getOpacity, setOpacity] = createSignal(1)
  const startTime = performance.now() // animation start
  function fadeOut(now: number) {
    const elapsed = now - startTime
    const progress = clamp(elapsed / fadeDuration, 0, 1)

    setOpacity(1 - Math.pow(progress, 2)) // use the ease-in function t^2

    // tell parent ping is finished if animation done
    if (Math.abs(1 - progress) <= Number.EPSILON) {
      props.finish()
      return
    }

    // continue in next frame
    requestAnimationFrame(fadeOut)
  }

  // start animating fade
  fadeOut(performance.now())

  const getRawPingBrush = createMemo(() => {
    if (pingBrush) {
      // if the brush already exists, just update it
      csgEvaluator.evaluate(
        getRingBrush(),
        props.coneBrush,
        INTERSECTION,
        pingBrush
      )
    } else {
      // if the brush doesn't exist, create it
      pingBrush = csgEvaluator.evaluate(
        getRingBrush(),
        props.coneBrush,
        INTERSECTION
      )
    }

    pingBrush.updateMatrixWorld()
    return { brush: pingBrush }
  })

  // apply the material to the ping brush
  const getPingBrush = createMemo(() => {
    // update ping brush
    const currentPingBrush = getRawPingBrush().brush
    currentPingBrush.material = ownedMaterial
    currentPingBrush.material.opacity = getOpacity()
    currentPingBrush.material.needsUpdate = true

    // use a wrapper to force the reference to change
    // so that dependents will re-evaluate
    return { brush: currentPingBrush }
  })

  createEffect(
    on(getPingBrush, () => {
      // render
      graphing.requestRender()
    })
  )

  return <></>
}
