import { SensorType } from '../types/SensorData'

// localization of sensor types
export const sensorTypeLabels: { [K in SensorType['type']]: string } = {
  ultrasonic: 'Ultrasonic',
}
