export type UltrasonicData = {
  type: 'ultrasonic'
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
} & SensorType

export const sensorTypeLabels: { [K in SensorType['type']]: string } = {
  ultrasonic: 'Ultrasonic',
}
