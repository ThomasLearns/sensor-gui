import { createContext } from 'solid-js'
import * as z from 'zod'

// context information for the cage configuration.
export type CageData = {
  length: number // in feet
  width: number // in feet
  // a 2d string array layed out such that the appearance of the 2d array
  // in an IDE will match the relative layout of the labels on the displayed grid
  labels: string[][]
  rowCount: number // derived from labels
  columnCount: number // derived from labels
}

export const parseCageData = z.object({
  length: z.number(),
  width: z.number(),
  labels: z.array(z.array(z.string())),
  rowCount: z.number(),
  columnCount: z.number(),
})

export const CageContext = createContext<CageData>()
