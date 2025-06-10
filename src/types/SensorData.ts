import { Accessor, Component, Setter } from 'solid-js'

export type UltrasonicData = {
  type: 'ultrasonic'
  renderer: Component<{}>
  measuringAngle: number

  getPingHandler: Accessor<undefined | ((distance: number) => void)>
  setPingHandler: Setter<undefined | ((distance: number) => void)>
}

export type SensorType = UltrasonicData

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
  maxRange: number
} & SensorType

export const sensorTypeLabels: { [K in SensorType['type']]: string } = {
  ultrasonic: 'Ultrasonic',
}
