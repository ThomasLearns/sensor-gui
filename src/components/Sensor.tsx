import { Component, createMemo } from 'solid-js'
import { SensorData } from '../types/SensorData'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { GridContext } from '../contexts/GridContext'

// color of elements comprising sensor svg
const textColor = 'red'

// Visual indicator for a sensor and its pings
export const Sensor: Component<{
  sensorData: SensorData
}> = (props) => {
  // we need grid contextual data to scale feet to screen pixels
  const grid = useContextOrThrow(GridContext)

  // calculate the position (screen pixels) of the sensor
  const getX = createMemo(() => grid.getXScale()(props.sensorData.xFeet))
  const getY = createMemo(() => grid.getYScale()(props.sensorData.yFeet))

  return (
    <>
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
          stroke={textColor}
          stroke-width="1"
          transform-origin="center"
          transform={`translate(${getX()}, ${getY()})`}
          fill-opacity="0"
        />
      </g>
    </>
  )
}
