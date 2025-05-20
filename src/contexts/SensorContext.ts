import { SensorData } from '../types/SensorData'
import { Accessor, createContext } from 'solid-js'

// creates context information for each sensor to have about itself
export const SensorContext = createContext<{
  data: SensorData
  index: Accessor<number>
}>()
