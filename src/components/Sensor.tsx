import { Component, createMemo, createSignal, JSX, Show } from 'solid-js'
import { SensorData } from '../types/SensorData'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { GridContext } from '../contexts/GridContext'
import { SidebarContext } from '../contexts/SidebarContext'
import { Portal } from 'solid-js/web'
import { SensorEditor } from './SensorEditor'
import { SetStoreFunction } from 'solid-js/store'
import { SensorContext } from '../contexts/SensorContext'

// color of elements comprising sensor svg
const textColor = 'oklch(57.7% 0.245 27.325)'

// Visual indicator for a sensor and its pings
export const Sensor: Component<{
  setSensor: SetStoreFunction<SensorData>
}> = (props) => {
  // we need grid contextual data to scale feet to screen pixels
  const grid = useContextOrThrow(GridContext)

  const sidebar = useContextOrThrow(SidebarContext)

  const sensor = useContextOrThrow(SensorContext)

  // calculate the position (screen pixels) of the sensor
  const getX = createMemo(() => grid.getXScale()(sensor.xFeet))
  const getY = createMemo(() => grid.getYScale()(sensor.yFeet))

  const [usingSidebar, setUsingSidebar] = createSignal(false)

  // when the indicator is clicked, upon up a sidebar
  // to edit the sensor's data
  function onClick(event: MouseEvent) {
    if (usingSidebar() === true) {
      // close sidebar if already open
      sidebar.clearSidebar?.()
      return
    }

    // prepare and open sidebar
    sidebar.clearSidebar?.(() => setUsingSidebar(false))
    setUsingSidebar(true)

    // this click is handled. prevent it from propogating
    event.stopPropagation()
  }

  return (
    <>
      {/* <div class="gray"></div> */}
      <g>
        <circle
          r="15"
          onClick={onClick}
          class="cursor-pointer"
          stroke={textColor}
          stroke-width="1"
          transform-origin="center"
          transform={`translate(${getX()}, ${getY()})`}
          fill-opacity={usingSidebar() === true ? '0.75' : '0'}
          fill="white"
        />
        {/* sensor label */}
        <text
          fill={textColor}
          pointer-events="none"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="monospace"
          font-size="20"
          transform={`translate(${getX()}, ${getY()})`}
        >
          {sensor.routNumber}
        </text>
        {/* circle around label */}
      </g>
      <Show when={usingSidebar() === true && sidebar.mount}>
        {(mountRef) => (
          <Portal mount={mountRef()}>
            <SensorEditor setSensor={props.setSensor} />
          </Portal>
        )}
      </Show>
    </>
  )
}
