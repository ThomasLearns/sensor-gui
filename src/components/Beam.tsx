import { Component, createMemo, createSignal } from 'solid-js'
import { CageContext } from '../contexts/CageContext'
import { GridContext } from '../contexts/GridContext'
import { SensorContext } from '../contexts/SensorContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { BeamContours } from './BeamContours'
import { BeamEdgeClipPath } from './BeamEdgeClipPath'
import { BeamRangeClipPath } from './BeamRangeClipPath'
import { BeamPings } from './BeamPings'

export const Beam: Component<{}> = () => {
  const cage = useContextOrThrow(CageContext)
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  // ids for clip paths used to shape the svg into a beam shape
  const [getBeamClipPathId, setBeamClipPathId] = createSignal('')
  const [getBeamRangeClipPathId, setBeamRangeClipPathId] = createSignal('')

  // get the distance in pixels from one corner of the cage to the opposite
  const getCornerToCornerDistance = createMemo(
    () =>
      // distance = sqrt(x^2 + y^2)
      grid.pixelsPerFoot *
      Math.sqrt(Math.pow(cage.length, 2) + Math.pow(cage.width, 2))
  )

  // ping testing. will be replaced by receiving pings from main process
  const test = () => {
    sensor.data.getPingHandler()?.(100)
    setTimeout(test, 2000)
  }

  return (
    <>
      {/* start by clipping at the maximum range (in xy, ignoring z component) */}
      <BeamRangeClipPath setId={setBeamRangeClipPathId} />
      {/* clip beam at edges of measuring angle */}
      <BeamEdgeClipPath
        setId={setBeamClipPathId}
        previousClipId={getBeamRangeClipPathId()}
      />
      <g class="fill-secondary pointer-events-none">
        {/* display a circle (clipped into beam shape) with smallest radius capable
        of going from one cage corner to opposite */}
        <circle
          fill-opacity="0.2"
          r={`${getCornerToCornerDistance()}px`}
          cx={`${grid.getXScale()(sensor.data.xFeet)}px`}
          cy={`${grid.getYScale()(sensor.data.yFeet)}px`}
          clip-path={`url(#${getBeamClipPathId()})`}
        />
      </g>
      <BeamContours clip-path={`url(#${getBeamClipPathId()})`} />
      <BeamPings clip-path={`url(#${getBeamClipPathId()})`} />
    </>
  )
}
