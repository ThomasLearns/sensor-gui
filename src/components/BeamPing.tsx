import { Component } from 'solid-js'
import { GridContext } from '../contexts/GridContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { SensorContext } from '../contexts/SensorContext'
import { Transition } from 'solid-transition-group'

// display a single ping indicator
export const BeamPing: Component<{
  'distance': number
  'clip-path'?: string
  'finish': () => unknown
}> = (props) => {
  // get contextual information
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  return (
    <>
      <Transition
        onEnter={(element, done) => {
          element
            .animate([{ opacity: 1 }, { opacity: 0 }], {
              duration: 1000,
              easing: 'ease-in',
            })
            .finished.then(() => {
              props.finish()
              done()
            })
        }}
        appear
      >
        <g class="fill-none stroke-accent">
          <circle
            clip-path={props['clip-path']}
            stroke-width="4"
            r={`${props.distance}px`}
            cx={grid.getXScale()(sensor.data.xFeet)}
            cy={grid.getYScale()(sensor.data.yFeet)}
          />
        </g>
      </Transition>
    </>
  )
}
