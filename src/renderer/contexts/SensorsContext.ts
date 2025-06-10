import { createContext } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import { SensorData } from '../../types/SensorData'

export const SensorsContext = createContext<{
  sensors: SensorData[]
  setSensors: SetStoreFunction<SensorData[]>
}>()
