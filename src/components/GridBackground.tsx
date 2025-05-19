import { Component, createMemo, For } from 'solid-js'
import { CageContext } from '../contexts/CageContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { GridContext } from '../contexts/GridContext'

// display the lines and labels comprising the grid's background
export const GridBackground: Component<{}> = () => {
  // load contextual data for the cage and the grid
  const cage = useContextOrThrow(
    CageContext,
    'Could not load cage context information'
  )
  const grid = useContextOrThrow(
    GridContext,
    'Could not load grid context information'
  )

  // derive the intended column count from the number of labels in each row
  // (use the row with the most labels to derive this)
  const getColumnCount = createMemo(() =>
    cage.labels.reduce(
      (previous, current) =>
        previous > current.length ? previous : current.length,
      0
    )
  )

  // derive the pixel height of each row
  const getRowHeight = createMemo(
    () => grid.scale.getY()(cage.height / cage.labels.length) - grid.getTop()
  )
  // derive the pixel width of each row
  const getColumnWidth = createMemo(
    () => grid.scale.getX()(cage.width / getColumnCount()) - grid.getLeft()
  )

  return (
    <>
      {/* horizontal row lines */}
      <For each={new Array(cage.labels.length + 1)}>
        {(_, index) => (
          <path
            stroke="black"
            d={
              `M ${grid.getLeft()} ${
                grid.getTop() + index() * getRowHeight()
              }\n` +
              `L ${grid.getRight()} ${
                grid.getTop() + index() * getRowHeight()
              }\n`
            }
          />
        )}
      </For>
      {/* vertical column lines */}
      <For each={new Array(getColumnCount() + 1)}>
        {(_, index) => (
          <path
            stroke="black"
            d={
              `M ${
                grid.getLeft() + index() * getColumnWidth()
              } ${grid.getTop()}\n` +
              `L ${
                grid.getLeft() + index() * getColumnWidth()
              } ${grid.getBottom()}\n`
            }
          />
        )}
      </For>
    </>
  )
}
