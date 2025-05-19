import { Component, For } from 'solid-js'
import { CageContext } from '../contexts/CageContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { GridContext } from '../contexts/GridContext'

const strokeColor = 'white'

// display the lines and labels comprising the grid's background
export const GridLines: Component<{}> = () => {
  // load contextual data for the cage and the grid
  const cage = useContextOrThrow(
    CageContext,
    'Could not load cage context information'
  )
  const grid = useContextOrThrow(
    GridContext,
    'Could not load grid context information'
  )

  return (
    <>
      {/* horizontal row lines */}
      <For each={new Array(cage.rowCount + 1)}>
        {(_, index) => (
          <path
            stroke={strokeColor}
            d={
              `M ${grid.left} ${grid.top + index() * grid.rowHeight}\n` +
              `L ${grid.right} ${grid.top + index() * grid.rowHeight}\n`
            }
          />
        )}
      </For>
      {/* vertical column lines */}
      <For each={new Array(cage.columnCount + 1)}>
        {(_, index) => (
          <path
            stroke={strokeColor}
            d={
              `M ${grid.left + index() * grid.columnWidth} ${grid.top}\n` +
              `L ${grid.left + index() * grid.columnWidth} ${grid.bottom}\n`
            }
          />
        )}
      </For>
    </>
  )
}
