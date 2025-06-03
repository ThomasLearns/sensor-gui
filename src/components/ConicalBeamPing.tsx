import {
  Component,
  createEffect,
  createMemo,
  onCleanup,
  onMount,
} from 'solid-js'
import { GraphingContext } from '../contexts/GraphingContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import {
  Color,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from 'three'
import { Brush, Evaluator, INTERSECTION, SUBTRACTION } from 'three-bvh-csg'
import { formatHex, oklch } from 'culori'
import { SensorContext } from '../contexts/SensorContext'
import { metersPerFoot } from '../util/mathConstants'
import { clamp } from 'three/src/math/MathUtils.js'

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

  // material used for displaying pings
  const pingMaterial = new MeshBasicMaterial({
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

  // for csg operations
  const evaluator = new Evaluator()

  // the outer sphere - the inner sphere forms a thin hollow sphere that
  // we can intersect with the cone to get a ping indicator
  const outerSphereBrush = new Brush(new SphereGeometry(1), pingMaterial)
  const innerSphereBrush = new Brush(new SphereGeometry(1), pingMaterial)

  // create the brush and mesh for the ping
  const pingBrush = new Brush()
  const pingMesh = new Mesh(pingBrush.geometry, pingMaterial)

  onMount(() => {
    // add the ping to the canvas
    graphing.scene.add(pingMesh)
    onCleanup(() => {
      // cleanup ping
      graphing.scene.remove(pingMesh)
      pingMesh.geometry.dispose()
      pingMesh.material.dispose()

      // rerender now that ping is removed
      graphing.requestRender()
    })
  })

  createEffect(() => {
    // update ping brush
    evaluator.evaluate(
      evaluator.evaluate(
        getOuterSphereBrush(),
        getInnerSphereBrush(),
        SUBTRACTION
      ),
      props.coneBrush,
      INTERSECTION,
      pingBrush
    )
    pingBrush.updateMatrixWorld()

    // apply ping brush to ping mesh
    pingMesh.geometry.dispose()
    pingMesh.geometry = pingBrush.geometry
    pingMesh.updateMatrixWorld()

    // render
    graphing.requestRender()
  })

  // generate the outer sphere centered on the sensor, with
  // a radius slightly larger than the ping distance
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

  // fade the ping out over time
  const startTime = performance.now() // animation start
  function fadeOut(now: number) {
    const elapsed = now - startTime
    const progress = clamp(elapsed / fadeDuration, 0, 1)

    const opacity = 1 - Math.pow(progress, 2) // use the ease-in function t^2

    // tell parent ping is finished if animation done
    if (Math.abs(1 - progress) <= Number.EPSILON) {
      props.finish()
      return
    }

    // set the opacity
    pingMesh.material.opacity = opacity
    graphing.requestRender()

    // continue in next frame
    requestAnimationFrame(fadeOut)
  }

  // start animating fade
  fadeOut(performance.now())

  return <></>
}
