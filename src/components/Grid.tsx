import { Component, createMemo, onMount } from 'solid-js'
import { createStore } from 'solid-js/store'
import { scaleLinear } from 'd3'
import { GridAxes } from './GridAxes'

// handle displaying the cage grid view and everything in it
export const Grid: Component<{
  // take in the size (in feet) the cage is
  size: {
    x: number
    y: number
  }
  // a 2D array giving each sector a label
  sectorLabels: string[][]
}> = (props) => {
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
    const feetWidthToHeightRatio = props.size.x / props.size.y

    // calculate the pixels we give per foot based on which dimension contstrains us the most
    const pixelPerFoot =
      pixelWidthToHeightRatio > feetWidthToHeightRatio
        ? allottedPixels.y / props.size.y
        : allottedPixels.x / props.size.x

    // calculate a grid size that has a 1:1 ratio and uses as much allotted space as possible
    return {
      x: props.size.x * pixelPerFoot - 2 * axisWidth,
      y: props.size.y * pixelPerFoot - 2 * axisWidth,
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
  const xScale = createMemo(() =>
    scaleLinear([0, props.size.x], [axisWidth, getGridSize().x + axisWidth])
  )
  // create a scale to convert a feet value to a pixel position in the y direction
  const yScale = createMemo(() =>
    scaleLinear([0, props.size.y], [axisWidth, getGridSize().y + axisWidth])
  )

  return (
    <div
      class="size-full"
      ref={gridRef}
    >
      <svg class="size-full">
        <GridAxes
          axisWidth={axisWidth}
          xScale={xScale()}
          yScale={yScale()}
          bottom={yScale()(props.size.y)}
          right={xScale()(props.size.x)}
        />
      </svg>
    </div>
  )
}
