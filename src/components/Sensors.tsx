import { Component, For } from 'solid-js'
import { SensorData } from '../types/SensorData'
import { Sensor } from './Sensor'
import { createStore } from 'solid-js/store'
import { SensorContext } from '../contexts/SensorContext'

// manage the display of each sensor and their pings
export const Sensors: Component<{}> = () => {
  // demo data until we have capability to have use
  // enter sensor data
  const [sensors, setSensors] = createStore<SensorData[]>([
    {
      xFeet: 5,
      yFeet: 13,
      horizontalAngle: 0,
      verticalAngle: 0,
      routNumber: 12,
      type: 'ultrasonic',
    },
  ])

  return (
    <>
      {/* display each sensor */}
      <For each={sensors}>
        {(sensor, index) => (
          <>
            <SensorContext.Provider value={sensor}>
              <Sensor setSensor={createStore(sensor)[1]} />
            </SensorContext.Provider>
          </>
        )}
      </For>
    </>
  )
}
