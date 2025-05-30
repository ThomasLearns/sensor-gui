import {
  Accessor,
  Component,
  createMemo,
  createSignal,
  For,
  getOwner,
  runWithOwner,
} from 'solid-js'
import { GridContext } from '../contexts/GridContext'
import { SensorContext } from '../contexts/SensorContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { createStore } from 'solid-js/store'
import { metersPerFoot } from '../util/mathConstants'
import { getXYProjectedRadius } from '../util/getXYProjectedRadius'
import { BeamPing } from './BeamPing'

// manages displaying of pings and supporting information ui
export const BeamPings: Component<{
  'clip-path'?: string
}> = (props) => {
  // get contextual information
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  // track hieght in feet of last ping to display to use
  const [getLastPingHeight, setLastPingHeight] = createSignal<Accessor<number>>(
    () => 0
  )

  // each ping has a memo for its distance. We use this component as the owner
  // context for these memos
  const owner = getOwner()

  // the list of all actively displayed pings for the current sensor
  const [pings, setPings] = createStore<Accessor<number>[]>([])

  // runs whenever a ping is received
  sensor.data.setPingHandler(() => (centimeters: number) => {
    runWithOwner(owner, () => {
      // from the centimeters, get the pixels of the length of the xy
      // distance (dropping z)
      const meters = centimeters / 100
      const feet = meters / metersPerFoot
      const pixels = createMemo(() => {
        const projectedFeet = getXYProjectedRadius(
          feet,
          sensor.calculate.theta(),
          sensor.calculate.phi()
        )
        return projectedFeet * grid.pixelsPerFoot
      })

      // save the height to be displayed to the user seperately
      setLastPingHeight(() =>
        createMemo(() => feet * Math.cos(sensor.calculate.phi()))
      )

      // create the ping to be displayed
      setPings(pings.length, () => pixels)
    })
  })

  return (
    <>
      {/* create a ping object for each distance tracked */}
      <For each={pings}>
        {(getPing, getIndex) => (
          <>
            <BeamPing
              distance={getPing()}
              clip-path={props['clip-path']}
              finish={() =>
                setPings((prevState) => prevState.toSpliced(getIndex(), 1))
              }
            />
          </>
        )}
      </For>
      {/* if the height isn't 0, display the height to the user */}
      <g class="fill-accent">
        <text
          x={`${grid.getXScale()(sensor.data.xFeet)}px`}
          y={`${grid.getYScale()(sensor.data.yFeet) + 24}px`}
          text-anchor="middle"
        >
          {Math.round(Math.abs(getLastPingHeight()() * 10)) / 10 !== 0
            ? `${
                getLastPingHeight()() > 0 ? '+' : ''
              }${getLastPingHeight()().toFixed(1)}ft`
            : ''}
        </text>
      </g>
    </>
  )
}
