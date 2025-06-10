import { Accessor, Component, Setter } from 'solid-js'

// information needed to describe an ultrasonic sensor
export type UltrasonicData = {
  type: 'ultrasonic'
  renderer: Component<{}> // component used to render the sensor
  measuringAngle: number // angle of the beam in degrees

  // signal for ping handling callback for this sensor
  getPingHandler: Accessor<undefined | ((distance: number) => void)>
  setPingHandler: Setter<undefined | ((distance: number) => void)>
}

// union of all sensor types
// (only one currently, but more may be added in the future)
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
  // should be set to the maximum range of the sensor, or if not applicable,
  // the smallest possible value representing the distance out from the sensor
  // that elements will be rendered
  maxRange: number
} & SensorType // data specific to the sensor type
