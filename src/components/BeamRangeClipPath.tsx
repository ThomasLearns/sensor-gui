import { Component, createEffect, createMemo, Setter } from 'solid-js'
import { SensorContext } from '../contexts/SensorContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { getXYProjectedRadius } from '../util/getXYProjectedRadius'
import { metersPerFoot } from '../util/mathConstants'
import { GridContext } from '../contexts/GridContext'

// create a clip path for the sensor's maximum range at
// its angle and send the id to the parent component
export const BeamRangeClipPath: Component<{
  setId: Setter<string> // used to give parent clippath id
  // if you were to hvae more than 1 BeamRangeClipPath under a single
  // sensor, both need to have different id specifiers or they will
  // have the same id
  idSpecifier?: string
  // id of another clippath, in case you want to combine clippaths
  previousClipId?: string
}> = (props) => {
  // get contextual information
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  // generate a unique clip path using the sensor's index.
  // the parent can also provide an id specifier in case more
  // uniqueness is needed
  const getClipPathId = createMemo(
    () => `beam-range-clip-path-${sensor.index()}` + (props.idSpecifier ?? '')
  )
  createEffect(() => props.setId(getClipPathId()))

  return (
    <>
      <defs>
        <clipPath id={getClipPathId()}>
          <circle
            clip-path={props.previousClipId}
            r={`${
              (grid.pixelsPerFoot *
                getXYProjectedRadius(
                  sensor.data.maxRange,
                  sensor.calculate.theta(),
                  sensor.calculate.phi()
                )) /
              metersPerFoot
            }`}
            cx={`${grid.getXScale()(sensor.data.xFeet)}px`}
            cy={`${grid.getYScale()(sensor.data.yFeet)}px`}
          />
        </clipPath>
      </defs>
    </>
  )
}
