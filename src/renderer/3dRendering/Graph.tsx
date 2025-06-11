import { Component, createEffect, createMemo, JSX, onMount } from 'solid-js'
import { CageContext } from '../contexts/CageContext.js'
import { GridContext } from '../contexts/GridContext.js'
import { useContextOrThrow } from '../../util/useContextOrThrow.js'
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import { GraphingContext, GraphingType } from '../contexts/GraphingContext.js'
import { SensorsContext } from '../contexts/SensorsContext.js'
import { metersPerFoot } from '../../util/mathConstants.js'

export const Graph: Component<{
  children: JSX.Element
}> = (props) => {
  const grid = useContextOrThrow(GridContext)
  const cage = useContextOrThrow(CageContext)
  const sensors = useContextOrThrow(SensorsContext)

  const getWidth = createMemo(() => grid.right - grid.left)

  const getHeight = createMemo(() => grid.bottom - grid.top)

  // rendering the scene
  let threeContainer: undefined | HTMLDivElement
  const scene = new Scene()
  const camera = new OrthographicCamera(0, cage.length, cage.width, 0, -1, 1)
  camera.position.set(0, 0, 0)

  // use the max range to determine the size of the fustrum
  // get the max range from the longest range sensor
  const maxRange = createMemo(
    () =>
      sensors.sensors.reduce(
        (max, sensor) => (max > sensor.maxRange ? max : sensor.maxRange),
        0
      ) / metersPerFoot
  )

  // set the camera near and far planes to fit max range of sensors
  createEffect(() => {
    // update planes
    camera.far = -maxRange() - Number.EPSILON
    camera.near = maxRange() + Number.EPSILON

    // update camera
    camera.updateProjectionMatrix()
    graphing.requestRender() // not sure if needed, but would assume it is (inconvenient to test)
  })

  // renderer
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    depth: false,
    powerPreference: 'high-performance',
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  onMount(() => {
    if (threeContainer === undefined)
      throw new Error('Could not load 3D rendering container')
    threeContainer.append(renderer.domElement)
    renderer.render(scene, camera)

    createEffect(() => {
      camera.right = cage.length
      camera.top = cage.width
      camera.updateProjectionMatrix()
      renderer.setSize(getWidth(), getHeight())
      // renderer.setViewport(grid.left, grid.bottom)
      renderer.render(scene, camera)
      threeContainer.style.left = `${grid.left}px`
      threeContainer.style.top = `${grid.top}px`
    })
  })

  let rerenderNeeded = false
  const graphing: GraphingType = {
    scene,
    // when a component calls for render, queue it up for next animation frame
    requestRender: () => {
      rerenderNeeded = true
    },
  }

  // rerender when needed at most once per animation frame
  function renderLoop() {
    if (rerenderNeeded) {
      renderer.render(scene, camera)
      rerenderNeeded = false
    }

    requestAnimationFrame(renderLoop)
  }

  renderLoop()

  return (
    <>
      <GraphingContext.Provider value={graphing}>
        {props.children}
        <div
          class="absolute size-min pointer-events-none"
          ref={threeContainer}
        />
      </GraphingContext.Provider>
    </>
  )
}
