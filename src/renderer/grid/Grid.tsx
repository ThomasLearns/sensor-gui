import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { scaleLinear } from 'd3'
import { GridAxes } from './GridAxes.jsx'
import { GridContext, GridData } from '../contexts/GridContext.js'
import { CageContext } from '../contexts/CageContext.js'
import { GridLines } from './GridLines.jsx'
import { useContextOrThrow } from '../../util/useContextOrThrow.js'
import { GridLabels } from './GridLabels.jsx'
import { Sensors } from '../sensors/Sensors.jsx'
import { Graph } from '../3dRendering/Graph.jsx'

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
    const pixelWidthToHeightRatio =
      (allottedPixels.x - 2 * axisWidth) / (allottedPixels.y - 2 * axisWidth)
    const feetWidthToHeightRatio = cage.length / cage.width

    // calculate the pixels we give per foot based on which dimension contstrains us the most
    const pixelPerFoot =
      pixelWidthToHeightRatio > feetWidthToHeightRatio
        ? (allottedPixels.y - 2 * axisWidth) / cage.width
        : (allottedPixels.x - 2 * axisWidth) / cage.length

    // calculate a grid size that has a 1:1 ratio and uses as much allotted space as possible
    return {
      x: cage.length * pixelPerFoot,
      y: cage.width * pixelPerFoot,
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
    setOnTopMount(onTopMount)
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
    scaleLinear([0, cage.length], [axisWidth, getGridSize().x + axisWidth])
  )
  // create a scale to convert a feet value to a pixel position in the y direction
  const getYScale = createMemo(() =>
    scaleLinear([0, cage.width], [getGridSize().y + axisWidth, axisWidth])
  )

  let onTopMount: SVGSVGElement | undefined
  const [getOnTopMount, setOnTopMount] = createSignal<SVGSVGElement>()

  const [grid, setGrid] = createStore<GridData>({
    getXScale,
    getYScale,
    pixelsPerFoot: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    rowHeight: 0,
    columnWidth: 0,
    getOnTopMount,
  })
  // keep the grid context information up to date
  createEffect(() => setGrid('pixelsPerFoot', getXScale()(1) - getXScale()(0)))
  createEffect(() => setGrid('left', getXScale()(0)))
  createEffect(() => setGrid('right', getXScale()(cage.length)))
  createEffect(() => setGrid('top', getYScale()(cage.width)))
  createEffect(() => setGrid('bottom', getYScale()(0)))
  createEffect(() =>
    setGrid('rowHeight', grid.bottom - getYScale()(cage.width / cage.rowCount))
  )
  createEffect(() =>
    setGrid(
      'columnWidth',
      getXScale()(cage.length / cage.columnCount) - grid.left
    )
  )

  return (
    <div
      class="size-full select-none relative"
      ref={gridRef}
    >
      <GridContext.Provider value={grid}>
        <Graph>
          <svg class="size-full text-base-content absolute">
            <GridAxes axisWidth={axisWidth} />
            <GridLines />
            <GridLabels />
            <Sensors />
          </svg>
        </Graph>
        <svg
          class="size-full text-base-content absolute pointer-events-none"
          ref={onTopMount}
        />
      </GridContext.Provider>
    </div>
  )
}
