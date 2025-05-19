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

  // will be replaced by a reference to a sub-object with
  // functions to parse pings as well as sensor-specific information
  // like beam angle
  type: 'ultrasonic'
}
