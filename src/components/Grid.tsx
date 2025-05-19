import { Component, createEffect, createMemo, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import { scaleLinear } from 'd3'
import { GridAxes } from './GridAxes'
import { GridContext, GridData } from '../contexts/GridContext'
import { CageContext } from '../contexts/CageContext'
import { GridLines } from './GridLines'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { GridLabels } from './GridLabels'

// handle displaying the cage grid view and everything in it
export const Grid: Component<{}> = () => {
  const cage = useContextOrThrow(
    CageContext,
    'Could not get cage context information'
  )

  // set how many pixels (per side) is set aside for rendering the axes
  const axisWidth = 35

  // we use grid's top level div element to get the screen space alotted to us
  let gridRef: HTMLDivElement | undefined

  // keep track of how many pixels are allocated to the grid
  const [allottedPixels, setAllottedPixels] = createStore({
    x: 100,
    y: 100,
  })

  // calculate how much space the grid will use, mainting a 1:1 ratio between x
  // and y while using as much space as possible. ignores axis space and space where
  // the grid will not be displayed, even if the grid's top level element has more space.
  const getGridSize = createMemo(() => {
    // we need to compare the "aspect ratio" of both the cage and the screen space allotted
    // to us so we can determine which border of the allotted space the grid will follow
    // and which will have a gap
    const pixelWidthToHeightRatio = allottedPixels.x / allottedPixels.y
    const feetWidthToHeightRatio = cage.width / cage.height

    // calculate the pixels we give per foot based on which dimension contstrains us the most
    const pixelPerFoot =
      pixelWidthToHeightRatio > feetWidthToHeightRatio
        ? allottedPixels.y / cage.height
        : allottedPixels.x / cage.width

    // calculate a grid size that has a 1:1 ratio and uses as much allotted space as possible
    return {
      x: cage.width * pixelPerFoot - 2 * axisWidth,
      y: cage.height * pixelPerFoot - 2 * axisWidth,
    }
  })

  // create a listener to recalculate alotted screen size when the grid top level element
  // is resized for any reason
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      setAllottedPixels({
        x: entry.contentBoxSize[0].inlineSize,
        y: entry.contentBoxSize[0].blockSize,
      })
    }
  })

  // once the element is loaded, begin tracking the available screen space for the grid
  onMount(() => {
    if (gridRef === undefined) throw new Error('Could not load grid')
    // get the available space and track it in a reactive solidjs store
    const gridStyle = window.getComputedStyle(gridRef)
    setAllottedPixels({
      x:
        gridRef.clientWidth -
        parseFloat(gridStyle.paddingLeft) -
        parseFloat(gridStyle.paddingRight),
      y:
        gridRef.clientHeight -
        parseFloat(gridStyle.paddingTop) -
        parseFloat(gridStyle.paddingBottom),
    })

    // upon changes to the size of the element, recalculate the alotted space
    resizeObserver.observe(gridRef)
  })

  // create a scale to convert a feet value to a pixel position in the x direction
  const getXScale = createMemo(() =>
    scaleLinear([0, cage.width], [axisWidth, getGridSize().x + axisWidth])
  )
  // create a scale to convert a feet value to a pixel position in the y direction
  const getYScale = createMemo(() =>
    scaleLinear([0, cage.height], [axisWidth, getGridSize().y + axisWidth])
  )

  // create the store carrying the contextual grid data
  const [grid, setGrid] = createStore<GridData>({
    getXScale,
    getYScale,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    rowHeight: 0,
    columnWidth: 0,
  })
  // keep the grid context information up to date
  createEffect(() => setGrid('left', getXScale()(0)))
  createEffect(() => setGrid('right', getXScale()(cage.width)))
  createEffect(() => setGrid('top', getYScale()(0)))
  createEffect(() => setGrid('bottom', getYScale()(cage.height)))
  createEffect(() =>
    setGrid('rowHeight', getYScale()(cage.height / cage.rowCount) - grid.top)
  )
  createEffect(() =>
    setGrid(
      'columnWidth',
      getXScale()(cage.width / cage.columnCount) - grid.left
    )
  )

  return (
    <div
      class="size-full"
      ref={gridRef}
    >
      <GridContext.Provider value={grid}>
        <svg class="size-full">
          <GridAxes axisWidth={axisWidth} />
          <GridLines />
          <GridLabels />
        </svg>
      </GridContext.Provider>
    </div>
  )
}
