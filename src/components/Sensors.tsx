import { Component, createMemo, For } from 'solid-js'
import { Sensor } from './Sensor'
import { createStore } from 'solid-js/store'
import { SensorContext } from '../contexts/SensorContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { SensorsContext } from '../contexts/SensorsContext'

// manage the display of each sensor and their pings
export const Sensors: Component<{}> = () => {
  const sensors = useContextOrThrow(SensorsContext)

  // when a ping is received, have sensors of the right type and id
  // display it
  window.electronAPI.onPingReceived((ping) => {
    sensors.sensors
      .filter(
        (sensor) =>
          sensor.type === ping.type && sensor.routNumber === ping.sensorId
      )
      .forEach((sensor) => sensor.getPingHandler()?.(ping.distance))
  })

  return (
    <>
      {/* display each sensor */}
      <For each={sensors.sensors}>
        {(sensor, index) => (
          <>
            <SensorContext.Provider
              value={{
                data: sensor,
                index: index,
                calculate: {
                  theta: createMemo(
                    () => (sensor.horizontalAngle * Math.PI) / 180
                  ),
                  phi: createMemo(
                    () => ((-sensor.verticalAngle + 90) * Math.PI) / 180
                  ),
                },
              }}
            >
              <Sensor setSensor={createStore(sensor)[1]} />
            </SensorContext.Provider>
          </>
        )}
      </For>
    </>
  )
}
