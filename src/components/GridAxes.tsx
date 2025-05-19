import { axisBottom, axisLeft, axisRight, axisTop, select, Selection } from 'd3'
import { Component, createEffect } from 'solid-js'
import { GridContext } from '../contexts/GridContext'
import { useContextOrThrow } from '../util/useContextOrThrow'

// the maximum "padding" between the axes and the grid.
// the actual padding is driven as well by the axis width allocated
// by the Grid component
const maximumPadding = 5

// color of axes
const axisColor = 'white'

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

  // used to set the color of all parts of a d3 axis
  function colorAxis(axis: Selection<SVGGElement, unknown, null, undefined>) {
    axis.selectAll('line').style('stroke', axisColor)
    axis.selectAll('path').style('stroke', axisColor)
    axis.selectAll('text').style('fill', axisColor)
    axis.selectAll('text').style('cursor', 'default')
  }

  // on any changes, have d3 recalculate the rendering of the axes
  createEffect(() => {
    if (
      topAxisRef === undefined ||
      bottomAxisRef === undefined ||
      leftAxisRef === undefined ||
      rightAxisRef === undefined
    )
      return

    colorAxis(select(topAxisRef).call(axisTop(gridContext.getXScale())))
    colorAxis(select(bottomAxisRef).call(axisBottom(gridContext.getXScale())))
    colorAxis(select(leftAxisRef).call(axisLeft(gridContext.getYScale())))
    colorAxis(select(rightAxisRef).call(axisRight(gridContext.getYScale())))
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
        transform={`translate(0, ${gridContext.bottom + padding})`}
      />
      {/* left axis */}
      <g
        ref={leftAxisRef}
        transform={`translate(${margin}, 0)`}
      />
      {/* right axis */}
      <g
        ref={rightAxisRef}
        transform={`translate(${gridContext.right + padding}, 0)`}
      />
    </>
  )
}
