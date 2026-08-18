// Placeing this in sensor folder bc no better place to put it.

import { VsArrowSmallUp } from 'solid-icons/vs'
import { Component, createSignal } from 'solid-js'
import { SensorsContext } from '../contexts/SensorsContext.js'
import { useContextOrThrow } from '../../util/useContextOrThrow.js'
import { UltrasonicRenderer } from './renderers/UltrasonicRenderer.jsx'
import { SensorData } from '../../types/SensorData.js'
import { launchQuery } from '../../util/ServerQueries.js'

// a button that creates a sensor
export const CreateLaunchMissileButton: Component<{}> = () => {
  // we need the setter for the sensors list
  const sensors = useContextOrThrow(SensorsContext)

  // called on click
  function createNewSensor() {
    const [pingHandler, setPingHandler] = createSignal<
      undefined | ((centimeters: number) => void)
    >()
    const [getIsConnected, setIsConnected] = createSignal(false)
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
      getIsConnected,
      setIsConnected,
    }

    sensors.setSensors(sensors.sensors.length, newSensor)
  }
  function handleClick() {
    console.log('Launch Missile button clicked')
    // launchQuery()
    window.electronAPI.sendLaunchMissileRequest();
  }

  return (
    <>
      <div
        class="tooltip tooltip-bottom tooltip-success"
        data-tip="Launch Missile"
      >
        <button
          onClick={handleClick}
          class="btn btn-outline btn-square btn-primary btn-sm"
        >
          <VsArrowSmallUp size="20" />
        </button>
      </div>
    </>
  )
}
