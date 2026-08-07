import { Accessor, Component, Setter } from 'solid-js'

interface SpecificSensor {
  type: 'ultrasonic' | 'virtual_missile_launcher'
  renderer: Component<{}> // component used to render the sensor

  // already handled by "type" field, but other components of the sensor
  // network reference sensors by id number, so we need to keep it
  sensorTypeId: number // unique identifier for the sensor type

  getPingHandler: Accessor<undefined | ((distance: number) => void)>
  setPingHandler: Setter<undefined | ((distance: number) => void)>
  
  // Track connection status
  getIsConnected: Accessor<boolean>
  setIsConnected: Setter<boolean>

  getIsMoving: Accessor<boolean>
  setIsMoving: Setter<boolean>

  getResetMovementCalibration: Accessor<undefined | (() => void)>
  setResetMovementCalibration: Setter<undefined | (() => void)>
}

// information needed to describe an ultrasonic sensor
export type UltrasonicData = SpecificSensor & {
  type: 'ultrasonic'
  measuringAngle: number // angle of the beam in degrees

  // unique identifier for the sensor type
  sensorTypeId: 1

  getPingHandler: Accessor<undefined | ((distance: number) => void)>
  setPingHandler: Setter<undefined | ((distance: number) => void)>
  
  getIsConnected: Accessor<boolean>
  setIsConnected: Setter<boolean>

  getIsMoving: Accessor<boolean>
  setIsMoving: Setter<boolean>

  getResetMovementCalibration: Accessor<undefined | (() => void)>
  setResetMovementCalibration: Setter<undefined | (() => void)>
}

export type VirtualMissileLauncherData = SpecificSensor & {
  type: 'virtual_missile_launcher'
  measuringAngle: number
  sensorTypeId: 2
}

// union of all sensor types
// (only one currently, but more may be added in the future)
export type SensorType = UltrasonicData | VirtualMissileLauncherData

// all the information needed to display a sensor
export type SensorData = {
  // position in the cage of the sensor
  xFeet: number
  yFeet: number

  // orientation of the sensor
  horizontalAngle: number
  verticalAngle: number

  // number used to identify data from this sensor
  routNumber: number

  // needed for ping calculations and performance optimization
  // should be set to the maximum range of the sensor, or if not applicable,
  // the smallest possible value representing the distance out from the sensor
  // that elements will be rendered
  maxRange: number
} & SensorType // data specific to the sensor type