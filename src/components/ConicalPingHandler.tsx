import {
  Accessor,
  Component,
  createEffect,
  createMemo,
  createSignal,
  For,
  getOwner,
  runWithOwner,
} from 'solid-js'
import { createStore } from 'solid-js/store'
import { GridContext } from '../contexts/GridContext'
import { SensorContext } from '../contexts/SensorContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { metersPerFoot } from '../util/mathConstants'
import { ConicalBeamPing } from './ConicalBeamPing'
import { Brush } from 'three-bvh-csg'

// display pings for a conical beam
export const ConicalPingHandler: Component<{
  coneBrush: Brush
}> = (props) => {
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  // each ping has a memo for its distance. We use this component as the owner
  // context for these memos
  const owner = getOwner()

  // track hieght in feet of last ping to display to use
  const [getLastPingHeight, setLastPingHeight] = createSignal<Accessor<number>>(
    () => 0
  )

  // the list of all actively displayed pings for the current sensor
  const [pinsData, setPingsData] = createStore<{
    pings: { distance: number }[]
  }>({
    pings: [],
  })

  sensor.data.setPingHandler(() => (centimeters: number) => {
    runWithOwner(owner, () => {
      const meters = centimeters / 100
      const feet = meters / metersPerFoot

      // save the height to be displayed to the user seperately
      setLastPingHeight(() =>
        createMemo(() => feet * Math.cos(sensor.calculate.phi()))
      )
      // create the ping to be displayed
      setPingsData('pings', pinsData.pings.length, { distance: feet })
    })
  })

  return (
    <>
      {/* create a ping object for each distance tracked */}
      <For each={pinsData.pings}>
        {(ping, getIndex) => (
          <>
            <ConicalBeamPing
              distance={ping.distance}
              coneBrush={props.coneBrush}
              finish={() =>
                setPingsData(
                  'pings',
                  pinsData.pings.filter((_, index) => index !== getIndex())
                )
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
