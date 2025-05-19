import { SensorData } from '../types/SensorData'
import { createContext } from 'solid-js'

// creates context information for each sensor to have about itself
export const SensorContext = createContext<SensorData>()
