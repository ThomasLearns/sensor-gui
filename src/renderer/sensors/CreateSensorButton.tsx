import { VsAdd } from 'solid-icons/vs'
import { Component, createSignal } from 'solid-js'
import { SensorsContext } from '../contexts/SensorsContext'
import { useContextOrThrow } from '../../util/useContextOrThrow'
import { UltrasonicRenderer } from '../sensors/renderers/UltrasonicRenderer'
import { SensorData } from '../../types/SensorData'

// a button that creates a sensor
export const CreateSensorButton: Component<{}> = () => {
  // we need the setter for the sensors list
  const sensors = useContextOrThrow(SensorsContext)

  // called on click
  function createNewSensor() {
    const [pingHandler, setPingHandler] = createSignal<
      undefined | ((centimeters: number) => void)
    >()
    const newSensor: SensorData = {
      xFeet: 0,
      yFeet: 0,
      horizontalAngle: 0,
      verticalAngle: 0,
      routNumber: 1,
      type: 'ultrasonic',
      renderer: UltrasonicRenderer,
      measuringAngle: 15,
      maxRange: 4,
      getPingHandler: pingHandler,
      setPingHandler,
      sensorTypeId: 1,
    }

    sensors.setSensors(sensors.sensors.length, newSensor)
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
