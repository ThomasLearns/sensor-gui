import { Component, createMemo, For } from 'solid-js'
import { metersPerFoot } from '../util/mathConstants'
import { getXYProjectedRadius } from '../util/getXYProjectedRadius'
import { SensorContext } from '../contexts/SensorContext'
import { GridContext } from '../contexts/GridContext'
import { useContextOrThrow } from '../util/useContextOrThrow'

// draw contour lines at each vertical foot onto a beam graphic
export const BeamContours: Component<{
  'clip-path'?: string
}> = (props) => {
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  // make a function that uses spherical coordinate formulas to calculate
  // z (vertical height component) from rho (3D distance from center)
  const getZComponentFinder = createMemo(
    // z = rho/cos(phi)
    () => (rho: number) => rho / Math.cos(sensor.calculate.phi())
  )
  return (
    <>
      <g class="fill-none stroke-secondary-content">
        <For
          each={
            new Array(
              Math.floor(
                (4 / metersPerFoot) * Math.abs(Math.cos(sensor.calculate.phi()))
              )
            )
          }
        >
          {(_, getIndex) => (
            <circle
              r={`${
                grid.pixelsPerFoot *
                getXYProjectedRadius(
                  getZComponentFinder()(getIndex() + 1),
                  sensor.calculate.theta(),
                  sensor.calculate.phi()
                )
              }px`}
              stroke-width="2"
              cx={`${grid.getXScale()(sensor.data.xFeet)}px`}
              cy={`${grid.getYScale()(sensor.data.yFeet)}px`}
              clip-path={props['clip-path']}
            />
          )}
        </For>
      </g>
    </>
  )
}
