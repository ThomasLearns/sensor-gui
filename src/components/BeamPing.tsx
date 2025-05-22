import { Component, createSignal, onMount } from 'solid-js'
import { GridContext } from '../contexts/GridContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { SensorContext } from '../contexts/SensorContext'

// display a single ping indicator
export const BeamPing: Component<{
  'distance': number
  'clip-path'?: string
  'finish': () => unknown
}> = (props) => {
  // get contextual information
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  // use to start the animation once ready
  const [animating, setAnimating] = createSignal(false)

  // ensure at least 1 animation frame has occurred so that opacity 1 has been
  // set, then start animating, causing opacity to go to 0 and this transition
  // to be animated
  onMount(() =>
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)))
  )

  return (
    <>
      <g class="fill-none stroke-accent">
        <circle
          clip-path={props['clip-path']}
          opacity={animating() === true ? 0 : 1}
          style={{ transition: 'opacity 1s ease-in' }}
          stroke-width="4"
          r={`${props.distance}px`}
          cx={grid.getXScale()(sensor.data.xFeet)}
          cy={grid.getYScale()(sensor.data.yFeet)}
          onTransitionEnd={props.finish}
        />
      </g>
    </>
  )
}
