import { createContext } from 'solid-js'
import { Scene } from 'three'

export type GraphingType = {
  scene: Scene
  requestRender: () => unknown
}

export const GraphingContext = createContext<GraphingType>()
