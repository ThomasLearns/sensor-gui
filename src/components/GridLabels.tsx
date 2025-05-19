import { Component, For } from 'solid-js'
import { CageContext } from '../contexts/CageContext'
import { GridContext } from '../contexts/GridContext'
import { useContextOrThrow } from '../util/useContextOrThrow'

const labelColor = 'white'

// display the labels for each grid sector
export const GridLabels: Component<{}> = () => {
  // load contextual information for the cage and grid
  const cage = useContextOrThrow(CageContext)
  const grid = useContextOrThrow(GridContext)

  return (
    <>
      {/* loop through each label */}
      <For each={cage.labels}>
        {(columns, rowIndex) => (
          <For each={columns}>
            {(label, columnIndex) => (
              <>
                {/* place the label centered in its sector */}
                <text
                  class="cursor-default"
                  transform={`translate(${
                    grid.left + (columnIndex() + 0.5) * grid.columnWidth
                  }, ${grid.top + (rowIndex() + 0.5) * grid.rowHeight})`}
                  text-anchor="middle"
                  font-family="Arial, sans-serif"
                  fill={labelColor}
                  dominant-baseline="middle"
                >
                  {label}
                </text>
              </>
            )}
          </For>
        )}
      </For>
    </>
  )
}
