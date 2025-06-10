// describe the information given from an untrasonic sensor ping
export type UltrasonicPing = {
  type: 'ultrasonic'
  distance: number
}

// union of all types of pings
export type Ping = {
  type: string
  sensorId: number
} & UltrasonicPing
