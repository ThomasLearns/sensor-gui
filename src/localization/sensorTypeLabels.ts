import { SensorType } from '../types/SensorData'

// localization of sensor types
export const sensorTypeLabels: Record<SensorType['type'], string> = {
  ultrasonic: 'Ultrasonic',
  testType: 'Test Sensor',
  TTR: 'Target Tracking Radar'
}
