import {
  axisBottom,
  axisLeft,
  axisRight,
  axisTop,
  ScaleLinear,
  select,
} from 'd3'
import { Component, createEffect } from 'solid-js'

const minimumPadding = 5

export const GridAxes: Component<{
  axisWidth: number
  xScale: ScaleLinear<number, number, never>
  yScale: ScaleLinear<number, number, never>
  bottom: number
  right: number
}> = (props) => {
  let topAxisRef: SVGGElement | undefined
  let bottomAxisRef: SVGGElement | undefined
  let leftAxisRef: SVGGElement | undefined
  let rightAxisRef: SVGGElement | undefined

  const padding =
    props.axisWidth >= minimumPadding ? minimumPadding : props.axisWidth
  const margin =
    props.axisWidth >= minimumPadding ? props.axisWidth - minimumPadding : 0

  createEffect(() => {
    if (
      topAxisRef === undefined ||
      bottomAxisRef === undefined ||
      leftAxisRef === undefined ||
      rightAxisRef === undefined
    )
      return

    select(topAxisRef).call(axisTop(props.xScale))
    select(bottomAxisRef).call(axisBottom(props.xScale))
    select(leftAxisRef).call(axisLeft(props.yScale))
    select(rightAxisRef).call(axisRight(props.yScale))
  })
  return (
    <>
      <g
        ref={topAxisRef}
        transform={`translate(0, ${margin})`}
      />
      <g
        ref={bottomAxisRef}
        transform={`translate(0, ${props.bottom + padding})`}
      />
      <g
        ref={leftAxisRef}
        transform={`translate(${margin}, 0)`}
      />
      <g
        ref={rightAxisRef}
        transform={`translate(${props.right + padding}, 0)`}
      />
    </>
  )
}
