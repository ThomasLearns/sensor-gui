import { Accessor, createContext } from 'solid-js'
import { SensorData } from '../../types/SensorData'

// creates context information for each sensor to have about itself
export const SensorContext = createContext<{
  data: SensorData
  index: Accessor<number>
  calculate: {
    theta: Accessor<number>
    phi: Accessor<number>
  }
}>()
