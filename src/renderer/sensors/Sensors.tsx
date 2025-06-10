import { Component, createMemo, For } from 'solid-js'
import { Sensor } from './Sensor'
import { createStore } from 'solid-js/store'
import { SensorContext } from '../contexts/SensorContext'
import { useContextOrThrow } from '../../util/useContextOrThrow'
import { SensorsContext } from '../contexts/SensorsContext'
import { GridContext } from '../contexts/GridContext'

// manage the display of each sensor and their pings
export const Sensors: Component<{}> = () => {
  const grid = useContextOrThrow(GridContext)
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

  window.electronAPI.onJam((typeId, sensorId) => {
    console.log('received jam', typeId, sensorId)
    sensors.sensors
      .filter(
        (sensor) =>
          (typeId === 0 || sensor.sensorTypeId === typeId) &&
          (sensorId === 0 || sensor.routNumber === sensorId)
      )
      .forEach((sensor) =>
        sensor.getPingHandler()?.(
          Math.round(Math.random() * sensor.maxRange * 100)
        )
      )
  })

  const [eventListeners, setEventListeners] = createStore<{
    drag: ((event: MouseEvent) => unknown)[]
    dragStop: ((event: MouseEvent) => unknown)[]
  }>({
    drag: [],
    dragStop: [],
  })

  // create event listeners for letting sensors be dragged
  function onDrag(callback: (event: MouseEvent) => unknown) {
    setEventListeners('drag', eventListeners.drag.length, () => callback)
    return () =>
      setEventListeners('drag', (prev) =>
        prev.filter((subscriber) => subscriber !== callback)
      )
  }
  function onDragStop(callback: (event: MouseEvent) => unknown) {
    setEventListeners('dragStop', eventListeners.drag.length, () => callback)
    return () =>
      setEventListeners('dragStop', (prev) =>
        prev.filter((subscriber) => subscriber !== callback)
      )
  }

  return (
    <>
      <g
        onMouseLeave={(event) =>
          eventListeners.dragStop.forEach((subscriber) => subscriber(event))
        }
        onMouseUp={(event) =>
          eventListeners.dragStop.forEach((subscriber) => subscriber(event))
        }
        onMouseMove={(event) =>
          eventListeners.drag.forEach((subscriber) => subscriber(event))
        }
      >
        {/* expand area to detect mouse movements anywhere on grid */}
        <rect
          opacity="0"
          x={grid.left}
          y={grid.top}
          width={grid.right - grid.left}
          height={grid.bottom - grid.top}
        />
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
                <Sensor
                  onDrag={onDrag}
                  onDragStop={onDragStop}
                  setSensor={createStore(sensor)[1]}
                />
              </SensorContext.Provider>
            </>
          )}
        </For>
      </g>
    </>
  )
}
