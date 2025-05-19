import { createContext } from 'solid-js'

// context information for the cage configuration.
export type CageData = {
  width: number // in feet
  height: number // in feet
  // a 2d string array layed out such that the appearance of the 2d array
  // in an IDE will match the relative layout of the labels on the displayed grid
  labels: string[][]
  rowCount: number // derived from labels
  columnCount: number // derived from labels
}

export const CageContext = createContext<CageData>()
