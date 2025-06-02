import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  getOwner,
  onMount,
  runWithOwner,
} from 'solid-js'
import { SensorData } from '../types/SensorData'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { GridContext } from '../contexts/GridContext'
import { SidebarContext } from '../contexts/SidebarContext'
import { SensorEditor } from './SensorEditor'
import { SetStoreFunction } from 'solid-js/store'
import { SensorContext } from '../contexts/SensorContext'
import { CageContext } from '../contexts/CageContext'

// color of elements comprising sensor svg
// const textColor = 'oklch(57.7% 0.245 27.325)'

// Visual indicator for a sensor and its pings
export const Sensor: Component<{
  setSensor: SetStoreFunction<SensorData>
}> = (props) => {
  // we need grid contextual data to scale feet to screen pixels
  const grid = useContextOrThrow(GridContext)
  const sidebar = useContextOrThrow(SidebarContext)
  const sensor = useContextOrThrow(SensorContext)
  const cage = useContextOrThrow(CageContext)

  // calculate the position (screen pixels) of the sensor
  const getX = createMemo(() => grid.getXScale()(sensor.data.xFeet))
  const getY = createMemo(() => grid.getYScale()(sensor.data.yFeet))

  const [usingSidebar, setUsingSidebar] = createSignal(false)

  const owner = getOwner()

  // when the indicator is clicked, upon up a sidebar
  // to edit the sensor's data
  function openSensorProperties(event?: MouseEvent) {
    console.log('clicked')
    if (usingSidebar() === true) {
      // close sidebar if already open
      setUsingSidebar(false)
      sidebar.setSidebar(<></>)
      return
    }

    // prepare and open sidebar
    setUsingSidebar(true)
    console.log('setting sidebar')
    console.log(sidebar.setSidebar)
    // we run with owner so that we have access to contexts
    runWithOwner(owner, () => {
      sidebar.setSidebar(<SensorEditor setSensor={props.setSensor} />, () => {
        setUsingSidebar(false)
      })
    })

    // this click is handled. prevent it from propogating
    event?.stopPropagation()
  }

  // keep the sensor in the cage if the cage changes size
  // (also may have side effect of keeping sensor in cage
  // if sensor moves, but this is already implemented elsewhere)
  createEffect(() => {
    if (sensor.data.xFeet >= cage.length) {
      props.setSensor('xFeet', cage.length)
    }
    if (sensor.data.yFeet >= cage.width) {
      props.setSensor('yFeet', cage.width)
    }
  })

  // when a sensor is created, automatically open its property editor
  onMount(() => {
    // queueMicrotask is used because onMount is too early to set the sidebar content.
    queueMicrotask(() => {
      openSensorProperties()
    })
  })

  return (
    <>
      <g class="stroke-primary fill-base-200">
        <circle
          r="1rem"
          onClick={openSensorProperties}
          class="cursor-pointer"
          stroke-width={usingSidebar() === true ? '1' : '0'}
          transform-origin="center"
          transform={`translate(${getX()}, ${getY()})`}
          fill-opacity="0.8"
        />
      </g>
      <g class="fill-primary cursor-pointer">
        {/* sensor label */}
        <text
          onClick={openSensorProperties}
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="monospace"
          font-size="20"
          transform={`translate(${getX()}, ${getY()})`}
        >
          {sensor.data.routNumber}
        </text>
        {/* circle around label */}
      </g>

      {/* render sensor pings */}
      <sensor.data.renderer />
    </>
  )
}
