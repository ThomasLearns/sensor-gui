import { SensorType } from '../types/SensorData'

// localization of sensor types
export const sensorTypeLabels: { [K in SensorType['type']]: string } = {
  ultrasonic: 'Ultrasonic',
  testType: 'Test Sensor',
  TTR: 'Target Tracking Radar',
  virtual_missile_launcher: 'Virtual Missile Launcher',
}
