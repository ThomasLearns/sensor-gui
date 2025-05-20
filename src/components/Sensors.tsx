import { Component, For } from 'solid-js'
import { Sensor } from './Sensor'
import { createStore } from 'solid-js/store'
import { SensorContext } from '../contexts/SensorContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { SensorsContext } from '../contexts/SensorsContext'

// manage the display of each sensor and their pings
export const Sensors: Component<{}> = () => {
  const sensors = useContextOrThrow(SensorsContext)

  return (
    <>
      {/* display each sensor */}
      <For each={sensors.sensors}>
        {(sensor, index) => (
          <>
            <SensorContext.Provider value={{ ...sensor, index }}>
              <Sensor setSensor={createStore(sensor)[1]} />
            </SensorContext.Provider>
          </>
        )}
      </For>
    </>
  )
}
