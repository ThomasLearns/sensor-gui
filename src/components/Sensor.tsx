import { Component, createMemo, createSignal, JSX, Show } from 'solid-js'
import { SensorData } from '../types/SensorData'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { GridContext } from '../contexts/GridContext'
import { SidebarContext } from '../contexts/SidebarContext'
import { Portal } from 'solid-js/web'

// color of elements comprising sensor svg
const textColor = 'oklch(57.7% 0.245 27.325)'

// Visual indicator for a sensor and its pings
export const Sensor: Component<{
  sensorData: SensorData
}> = (props) => {
  // we need grid contextual data to scale feet to screen pixels
  const grid = useContextOrThrow(GridContext)

  const sidebar = useContextOrThrow(SidebarContext)

  // calculate the position (screen pixels) of the sensor
  const getX = createMemo(() => grid.getXScale()(props.sensorData.xFeet))
  const getY = createMemo(() => grid.getYScale()(props.sensorData.yFeet))

  const [usingSidebar, setUsingSidebar] = createSignal(false)

  function onClick(event: MouseEvent) {
    if (usingSidebar() === true) {
      sidebar.clearSidebar?.()
      return
    }
    sidebar.clearSidebar?.(() => setUsingSidebar(false))
    setUsingSidebar(true)

    event.stopPropagation()
  }

  return (
    <>
      {/* <div class="gray"></div> */}
      <g>
        {/* sensor label */}
        <text
          fill={textColor}
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="monospace"
          font-size="20"
          transform={`translate(${getX()}, ${getY()})`}
        >
          {props.sensorData.routNumber}
        </text>
        {/* circle around label */}
        <circle
          r="15"
          onClick={onClick}
          class="cursor-pointer"
          stroke={textColor}
          stroke-width="1"
          transform-origin="center"
          transform={`translate(${getX()}, ${getY()})`}
          fill-opacity="0"
        />
      </g>
      <Show when={usingSidebar() === true && sidebar.mount}>
        {(mountRef) => (
          <Portal mount={mountRef()}>
            <div>test</div>
          </Portal>
        )}
      </Show>
    </>
  )
}
