import { ScaleLinear } from 'd3'
import { Accessor, createContext } from 'solid-js'

export const GridContext = createContext<{
  scale: {
    getX: Accessor<ScaleLinear<number, number, never>>
    getY: Accessor<ScaleLinear<number, number, never>>
  }
  getTop: Accessor<number>
  getBottom: Accessor<number>
  getLeft: Accessor<number>
  getRight: Accessor<number>
}>()
