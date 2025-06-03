import { ScaleLinear } from 'd3'
import { Accessor, createContext } from 'solid-js'
import { Scene } from 'three'

// context information for the grid (with respect to the screen)
export type GridData = {
  // the scales require accessors because a solidjs store cannot
  // make them reactive by itself
  getXScale: Accessor<ScaleLinear<number, number, never>>
  getYScale: Accessor<ScaleLinear<number, number, never>>

  pixelsPerFoot: number

  // positions (pixels) of the sides of the grid. derived from the scales
  top: number
  bottom: number
  left: number
  right: number
  // size of rows and columns (in pixels).
  // derived from the scales and cage context information
  rowHeight: number
  columnWidth: number
}

export const GridContext = createContext<GridData>()
