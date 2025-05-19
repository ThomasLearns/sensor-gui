import { createContext } from 'solid-js'

export const CageContext = createContext<{
  width: number
  height: number
  labels: string[][]
}>()
