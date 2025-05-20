import { VsAdd } from 'solid-icons/vs'
import { Component } from 'solid-js'
import { SensorsContext } from '../contexts/SensorsContext'
import { useContextOrThrow } from '../util/useContextOrThrow'

// a button that creates a sensor
export const CreateSensorButton: Component<{}> = () => {
  // we need the setter for the sensors list
  const sensors = useContextOrThrow(SensorsContext)

  // called on click
  function createNewSensor() {
    sensors.setSensors(sensors.sensors.length, {
      xFeet: 0,
      yFeet: 0,
      horizontalAngle: 0,
      verticalAngle: 0,
      routNumber: 1,
      type: 'ultrasonic',
    })
  }

  return (
    <>
      <div
        class="tooltip tooltip-bottom tooltip-success"
        data-tip="Add Sensor"
      >
        <button
          onClick={createNewSensor}
          class="btn btn-outline btn-square btn-primary btn-sm"
        >
          <VsAdd size="20" />
        </button>
      </div>
    </>
  )
}
