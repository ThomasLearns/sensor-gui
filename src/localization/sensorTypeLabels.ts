import { SensorType } from '../types/SensorData'

// localization of sensor types
export const sensorTypeLabels: Record<SensorType['type'], string> = {
  ultrasonic: 'Ultrasonic',
  virtual_missile_launcher: 'Virtual Missile Launcher',
}
