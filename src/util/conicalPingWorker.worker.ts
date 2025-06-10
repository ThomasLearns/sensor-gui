/// <reference lib="webworker" />

// ping-csg-worker.ts
// This worker receives minimal geometry data, reconstructs the CSG shapes, performs the CSG, and sends back serializable geometry data.

import * as THREE from 'three'
import { Brush, Evaluator, INTERSECTION, SUBTRACTION } from 'three-bvh-csg'

// Listen for messages from the main thread
self.onmessage = (event) => {
  // Destructure the minimal data needed to reconstruct the shapes
  const { outer, inner, cone } = event.data

  // Reconstruct the outer sphere as a Brush
  // Always use unit sphere and scale, so we only need to send radius and position
  const outerSphere = new Brush(new THREE.SphereGeometry(1))
  outerSphere.scale.set(outer.radius, outer.radius, outer.radius)
  outerSphere.position.set(outer.position.x, outer.position.y, outer.position.z)
  outerSphere.updateMatrixWorld()

  // Reconstruct the inner sphere similarly
  const innerSphere = new Brush(new THREE.SphereGeometry(1))
  innerSphere.scale.set(inner.radius, inner.radius, inner.radius)
  innerSphere.position.set(inner.position.x, inner.position.y, inner.position.z)
  innerSphere.updateMatrixWorld()

  // Reconstruct the cone
  // Use unit cone, scale, and quaternion for orientation
  const coneBrush = new Brush(
    new THREE.ConeGeometry(cone.radius, 1).translate(0, -0.5, 0)
  )
  coneBrush.scale.set(cone.scale, cone.scale, cone.scale)
  coneBrush.position.set(cone.position.x, cone.position.y, cone.position.z)
  coneBrush.quaternion.set(
    cone.quaternion.x,
    cone.quaternion.y,
    cone.quaternion.z,
    cone.quaternion.w
  )
  coneBrush.updateMatrixWorld()

  // Perform CSG: (outer - inner) ∩ cone
  const evaluator = new Evaluator()
  const ring = evaluator.evaluate(outerSphere, innerSphere, SUBTRACTION)
  const ping = evaluator.evaluate(ring, coneBrush, INTERSECTION)

  // Extract geometry data for transfer back to main thread
  const geom = ping.geometry
  const positions = geom.attributes.position.array
  const normals = geom.attributes.normal?.array
  const indices = geom.index?.array

  const transferables: Transferable[] = [
    positions.buffer,
    normals?.buffer,
    indices?.buffer,
  ].filter((el): el is ArrayBuffer => !!el)

  // Post the geometry data back, transferring buffers for performance
  self.postMessage(
    {
      positions,
      normals,
      indices,
    },
    transferables
  )
}
