import {
  Component,
  createComputed,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  JSX,
  onMount,
  Show,
} from 'solid-js'
import { SensorData } from '../types/SensorData'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { GridContext } from '../contexts/GridContext'
import { SidebarContext } from '../contexts/SidebarContext'
import { Portal } from 'solid-js/web'
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

  // when the indicator is clicked, upon up a sidebar
  // to edit the sensor's data
  function onClick(event?: MouseEvent) {
    if (usingSidebar() === true) {
      // close sidebar if already open
      setUsingSidebar(false)
      sidebar.setSidebar(() => <></>)
      return
    }

    // prepare and open sidebar
    setUsingSidebar(true)
    sidebar.setSidebar(
      () => (
        <SensorContext.Provider value={sensor}>
          <SensorEditor setSensor={props.setSensor} />
        </SensorContext.Provider>
      ),
      () => {
        setUsingSidebar(false)
      }
    )

    // this click is handled. prevent it from propogating
    event?.stopPropagation()
  }

  // keep the sensor in the cage if the cage changes size
  // (also may have side effect of keeping sensor in cage
  // if sensor moves, but this is already implemented elsewhere)
  createComputed(() => {
    console.log(cage.length - sensor.data.xFeet)
    if (sensor.data.xFeet >= cage.length) {
      props.setSensor('xFeet', cage.length)
    }
    if (sensor.data.yFeet >= cage.width) {
      props.setSensor('yFeet', cage.width)
    }
  })

  // onMount(onClick)

  return (
    <>
      <g class="stroke-primary fill-base-200">
        <circle
          r="1rem"
          onClick={onClick}
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
          onClick={onClick}
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

      <sensor.data.renderer />
    </>
  )
}
