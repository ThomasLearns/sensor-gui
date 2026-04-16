import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'
import { GraphingContext } from '../../contexts/GraphingContext.js'
import { useContextOrThrow } from '../../../util/useContextOrThrow.js'
import { SensorContext } from '../../contexts/SensorContext.js'
import { clamp } from 'three/src/math/MathUtils.js'
import { pingLineMaterial, pingMaterial } from '../../3dRendering/materials.js'
import { EdgesGeometry, Mesh, Quaternion, SphereGeometry, Vector3 } from 'three'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js'

const fadeDuration = 500 // milliseconds

export const ConicalBeamPing: Component<{
  distance: number
  finish: () => unknown
}> = (props) => {
  // get contextual information
  const sensor = useContextOrThrow(SensorContext)
  const graphing = useContextOrThrow(GraphingContext)

  // copies of materials (so that we can mess with them)
  const ownedMaterial = pingMaterial.clone()
  const ownedLineMaterial = pingLineMaterial.clone()

  // geometry of ping. it is a circular portion of a sphere's shell
  const pingGeometry = new SphereGeometry(
    1, // radius 1 means easy to scale
    32, // default
    16, // default
    0, // default
    Math.PI * 2, // default
    0, // default
    // theta length. Angle of "circular" cutout of sphere
    (sensor.data.measuringAngle * Math.PI) / 2 / 180,
  )
  // mesh of ping for rendering
  const pingMesh = new Mesh(pingGeometry, ownedMaterial)
  pingMesh.renderOrder = 0

  // when perpendicular to camera, ping is very thin. We render the border of it
  // with a thicker line to compensate.
  // get border of ping geometary
  const pingEdgeGeometry = new EdgesGeometry(pingGeometry, 45)
  const pingEdgeSegments = new LineSegments2(
    new LineSegmentsGeometry().fromEdgesGeometry(pingEdgeGeometry),
    ownedLineMaterial,
  )
  pingEdgeSegments.renderOrder = 1

  // calculate the rotation of the sensor so the ping parts can be rotated identically
  const getSensorQuaternion = createMemo(() =>
    new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      new Vector3(
        Math.sin(sensor.calculate.phi()) * Math.cos(sensor.calculate.theta()),
        Math.sin(sensor.calculate.phi()) * Math.sin(sensor.calculate.theta()),
        Math.cos(sensor.calculate.phi()),
      ).normalize(),
    ),
  )

  // keep ping updated with changes to sensor
  createEffect(() => {
    // get the rotation of the sensor
    const rotation = getSensorQuaternion()

    // set position, scale, rotation, opacity for ping
    pingMesh.position.set(sensor.data.xFeet, sensor.data.yFeet, -2)
    pingMesh.scale.set(props.distance, props.distance, props.distance)
    pingMesh.quaternion.copy(rotation)
    pingMesh.updateMatrixWorld()
    pingMesh.material.opacity = getOpacity()
    pingMesh.material.needsUpdate = true

    // set position, scale, rotation, opacity for ping's border
    pingEdgeSegments.position.set(sensor.data.xFeet, sensor.data.yFeet, -2)
    pingEdgeSegments.scale.set(props.distance, props.distance, props.distance)
    pingEdgeSegments.quaternion.copy(rotation)
    pingEdgeSegments.updateMatrixWorld()
    pingEdgeSegments.material.opacity = getOpacity()
    pingEdgeSegments.material.needsUpdate = true

    // queue render
    graphing.requestRender()
  })

  onMount(() => {
    // add the ping to the canvas
    graphing.scene.add(pingMesh)
    graphing.scene.add(pingEdgeSegments)

    graphing.requestRender()

    onCleanup(() => {
      // cleanup ping
      graphing.scene.remove(pingMesh)
      graphing.scene.remove(pingEdgeSegments)
      pingGeometry.dispose()
      pingMesh.material.dispose()
      pingEdgeGeometry.dispose()
      pingEdgeSegments.material.dispose()
      pingEdgeSegments.geometry.dispose()
      pingMesh.parent?.remove(pingMesh)
      pingEdgeSegments.parent?.remove(pingEdgeSegments)
      // rerender now that ping is removed
      graphing.requestRender()
    })
  })

  // fade the ping out over time
  let [getOpacity, setOpacity] = createSignal(1)
  const startTime = performance.now() // animation start
  function fadeOut(now: number) {
    const elapsed = now - startTime
    const progress = clamp(elapsed / fadeDuration, 0, 1)

    // commented out due to performance reasons
    // its fully functional, but for multiple sensors it can
    // get laggy. Re-enable when threejs parts of program have better performance
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

  return <></>
}
