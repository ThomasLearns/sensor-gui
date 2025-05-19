import { Component, For } from 'solid-js'
import { SensorData } from '../types/SensorData'
import { Sensor } from './Sensor'

// manage the display of each sensor and their pings
export const Sensors: Component<{}> = () => {
  // demo data until we have capability to have use
  // enter sensor data
  const sensors: SensorData[] = [
    {
      xFeet: 5,
      yFeet: 13,
      horizontalAngle: 0,
      verticalAngle: 0,
      routNumber: 12,
      type: 'ultrasonic',
    },
  ]

  return (
    <>
      {/* display each sensor */}
      <For each={sensors}>
        {(sensor, index) => (
          <>
            <Sensor sensorData={sensor} />
          </>
        )}
      </For>
    </>
  )
}
