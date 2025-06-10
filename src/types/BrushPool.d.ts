// details about brush types used to determine if an available
// brush meets constraints of the borrower
type SphereEntry = {
  type: 'sphere'
}
type ConeEntry = {
  type: 'cone'
  radius: number
}
export type BrushSpecifics = SphereEntry | ConeEntry

type BrushEntry = {
  brush: Brush
  available: boolean // marks if the brush is available for borrowing
} & BrushSpecifics

// pool of brushes that can be borrowed and returned
export type BrushPool = BrushEntry[]
