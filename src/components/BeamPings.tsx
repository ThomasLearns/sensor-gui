import { Component, createSignal, For, Show } from 'solid-js'
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
  const [getLastPingHeight, setLastPingHeight] = createSignal(0)

  // the list of all actively displayed pings for the current sensor
  const [pings, setPings] = createStore<number[]>([])

  // runs whenever a ping is received
  sensor.data.setPingHandler((_) => (centimeters: number) => {
    // from the centimeters, get the pixels of the length of the xy
    // distance (dropping z)
    const meters = centimeters / 100
    const feet = meters / metersPerFoot
    const projectedFeet = getXYProjectedRadius(
      feet,
      sensor.calculate.theta(),
      sensor.calculate.phi()
    )
    const pixels = projectedFeet * grid.pixelsPerFoot

    // save the height to be displayed to the user seperately
    setLastPingHeight(feet * Math.cos(sensor.calculate.phi()))

    // create the ping to tbe displayed
    setPings(pings.length, pixels)
  })

  return (
    <>
      {/* create a ping object for each distance tracked */}
      <For each={pings}>
        {(ping, getIndex) => (
          <BeamPing
            distance={ping}
            clip-path={props['clip-path']}
            finish={() => setPings((prev) => prev.toSpliced(getIndex(), 1))}
          />
        )}
      </For>
      {/* if the height isn't 0, display the height to the user */}
      <Show when={Math.abs(getLastPingHeight()) > Number.EPSILON}>
        <g class="fill-accent">
          <text
            x={`${grid.getXScale()(sensor.data.xFeet)}px`}
            y={`${grid.getYScale()(sensor.data.yFeet) + 24}px`}
            text-anchor="middle"
          >
            {`${getLastPingHeight() > 0 ? '+' : '-'}${
              Math.round(Math.abs(getLastPingHeight()) * 10) / 10
            }ft`}
          </text>
        </g>
      </Show>
    </>
  )
}
