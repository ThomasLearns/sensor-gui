import { axisBottom, axisLeft, axisRight, axisTop, select } from 'd3'
import { Component, createEffect } from 'solid-js'
import { GridContext } from '../contexts/GridContext'
import { useContextOrThrow } from '../util/useContextOrThrow'

// the maximum "padding" between the axes and the grid.
// the actual padding is driven as well by the axis width allocated
// by the Grid component
const maximumPadding = 5

export const GridAxes: Component<{
  axisWidth: number
}> = (props) => {
  // load in contextual information about the grid
  const gridContext = useContextOrThrow(
    GridContext,
    'Could not get grid context information'
  )

  // we need a reference to each axis element so we can have d3 set them up
  let topAxisRef: SVGGElement | undefined
  let bottomAxisRef: SVGGElement | undefined
  let leftAxisRef: SVGGElement | undefined
  let rightAxisRef: SVGGElement | undefined

  // calculate the padding and margin for the axes
  const padding =
    props.axisWidth >= maximumPadding ? maximumPadding : props.axisWidth
  const margin =
    props.axisWidth >= maximumPadding ? props.axisWidth - maximumPadding : 0

  // on any changes, have d3 recalculate the rendering of the axes
  createEffect(() => {
    if (
      topAxisRef === undefined ||
      bottomAxisRef === undefined ||
      leftAxisRef === undefined ||
      rightAxisRef === undefined
    )
      return

    select(topAxisRef).call(axisTop(gridContext.scale.getX()))
    select(bottomAxisRef).call(axisBottom(gridContext.scale.getX()))
    select(leftAxisRef).call(axisLeft(gridContext.scale.getY()))
    select(rightAxisRef).call(axisRight(gridContext.scale.getY()))
  })
  return (
    <>
      {/* top axis */}
      <g
        ref={topAxisRef}
        transform={`translate(0, ${margin})`}
      />
      {/* bottom axis */}
      <g
        ref={bottomAxisRef}
        transform={`translate(0, ${gridContext.getBottom() + padding})`}
      />
      {/* left axis */}
      <g
        ref={leftAxisRef}
        transform={`translate(${margin}, 0)`}
      />
      {/* right axis */}
      <g
        ref={rightAxisRef}
        transform={`translate(${gridContext.getRight() + padding}, 0)`}
      />
    </>
  )
}
