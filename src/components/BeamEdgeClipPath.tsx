import { Component, createEffect, createMemo, Setter } from 'solid-js'
import { GridContext } from '../contexts/GridContext'
import { SensorContext } from '../contexts/SensorContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { CageContext } from '../contexts/CageContext'
import { createStore } from 'solid-js/store'

// create a clippath outlining the edges of a beam and the edge of the cage
export const BeamEdgeClipPath: Component<{
  // used to give id of path to parent component
  setId: Setter<string>
  // id of another clippath for optional merging clippaths
  previousClipId?: string
}> = (props) => {
  const cage = useContextOrThrow(CageContext)
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  // an array of each corner and its distance clockwise along the edge from
  // the bottom left. Includes 2 laps of the cage
  const getCorners = createMemo(() => {
    const normalCorners = [
      { x: 0, y: 0, distance: 0 },
      { x: 0, y: cage.width, distance: cage.width },
      { x: cage.length, y: cage.width, distance: cage.width + cage.length },
      { x: cage.length, y: 0, distance: 2 * cage.width + cage.length },
    ]
    // append to the list a 2nd lap before returning
    return normalCorners.concat(
      normalCorners.map((corner) => ({
        ...corner,
        distance: corner.distance + 2 * cage.width + 2 * cage.length,
      }))
    )
  })

  const clipPathId = createMemo(() => `beam-edge-clip-path-${sensor.index()}`)
  createEffect(() => props.setId(clipPathId))

  // given a point (feet) on the cage edge, get the distance from the bottom left
  // corner following the edges clockwise
  function getPerimiterDistance(x: number, y: number) {
    // ensure the point is on an edge
    if (x !== 0 && x !== cage.length && y !== 0 && y !== cage.width)
      throw new Error(
        `Cannot get perimiter distance of point not on edge: (${x},${y})`
      )

    // determine the edge the point is on and calculate
    // the perimeter distance between the bottom left and it
    return x === 0
      ? y
      : y === cage.width
      ? cage.width + x
      : x === cage.length
      ? cage.width + cage.length + (cage.width - y)
      : 2 * cage.width + cage.length + (cage.length - x)
  }

  // given a point (feet) inside the cage and an angle (radians), return the
  // point where a line from that point would hit the edge of the cage
  function getBorderHit(
    x: number,
    y: number,
    angle: number
  ): { x: number; y: number } | null {
    // get the components of the angle
    const xComponent = Math.cos(angle)
    const yComponent = Math.sin(angle)

    // if the point is on an edge and the angle
    // points into the same edge, simply return
    // the input point
    if (
      (x === 0 && xComponent < 0) ||
      (x === cage.length && xComponent > 0) ||
      (y === 0 && yComponent < 0) ||
      (y === cage.width && yComponent > 0)
    )
      return { x, y }

    // for each edge, check to see if the angle would have a line hit it
    if (x > 0 && xComponent < 0) {
      const yOnLeftBorder = y + yComponent * (x / Math.abs(xComponent))
      if (yOnLeftBorder <= cage.width && yOnLeftBorder >= 0)
        return { x: 0, y: yOnLeftBorder }
    }

    if (x < cage.length && xComponent > 0) {
      const yOnRightBorder =
        y + yComponent * ((cage.length - x) / Math.abs(xComponent))
      if (yOnRightBorder <= cage.width && yOnRightBorder >= 0)
        return { x: cage.length, y: yOnRightBorder }
    }

    if (y > 0 && yComponent < 0) {
      const xOnBottomBorder = x + xComponent * (y / Math.abs(yComponent))
      if (xOnBottomBorder <= cage.length && xOnBottomBorder >= 0)
        return { x: xOnBottomBorder, y: 0 }
    }

    if (y < cage.width && yComponent > 0) {
      const xOnTopBorder =
        x + xComponent * ((cage.width - y) / Math.abs(yComponent))
      if (xOnTopBorder <= cage.length && xOnTopBorder >= 0)
        return { x: xOnTopBorder, y: cage.width }
    }

    return null
  }

  // the "points" string for the polygon representing the sensor's beam
  const polygonPoints = createMemo<string>(() => {
    // sensor position in pixels
    const gridX = grid.getXScale()(sensor.data.xFeet)
    const gridY = grid.getYScale()(sensor.data.yFeet)

    // get the bounding angles of the beam
    const leftAngle =
      ((sensor.data.horizontalAngle + sensor.data.measuringAngle / 2) *
        Math.PI) /
      180
    const rightAngle =
      ((sensor.data.horizontalAngle - sensor.data.measuringAngle / 2) *
        Math.PI) /
      180

    // start with the position of the sensor
    let points = `${gridX},${gridY}`

    // get where the left beam edge hits the cage edge
    const leftEdgeHit = getBorderHit(
      sensor.data.xFeet,
      sensor.data.yFeet,
      leftAngle
    )

    // get where the right beam edge hits the cage edge
    const rightEdgeHit = getBorderHit(
      sensor.data.xFeet,
      sensor.data.yFeet,
      rightAngle
    )

    // sensor outside of cage, stop tracking points
    if (leftEdgeHit === null || rightEdgeHit === null) return ''

    // add the point where the left beam edge hits the cage edge to our points
    points += ` ${grid.getXScale()(leftEdgeHit.x)},${grid.getYScale()(
      leftEdgeHit.y
    )}`

    // get the distance clockwise along the perimiter of the cage from
    // the bottom left corner for the points where the beam edges hit the cage edge
    const leftPerimiterDistance = getPerimiterDistance(
      leftEdgeHit.x,
      leftEdgeHit.y
    )
    let rightPerimiterDistance = getPerimiterDistance(
      rightEdgeHit.x,
      rightEdgeHit.y
    )

    // in order to find the corners between the two beam edges' cage intersections,
    // the right intersection needs to be further clockwise than the left from the bottom
    // left. If this isn't the case, have the right intersection "lap" the left by
    // moving it a full cycle around the perimeter
    if (leftPerimiterDistance > rightPerimiterDistance) {
      rightPerimiterDistance += 2 * cage.length + 2 * cage.width
    }

    getCorners()
      // get all corners between the left and right cage edge intersections
      .filter(
        (corner) =>
          corner.distance > leftPerimiterDistance &&
          corner.distance < rightPerimiterDistance
      )
      // add a point to the polygon for each corner found
      .forEach((corner) => {
        points += ` ${grid.getXScale()(corner.x)},${grid.getYScale()(corner.y)}`
      })

    // finally, add the right intersection to the polygon points
    points += ` ${grid.getXScale()(rightEdgeHit.x)},${grid.getYScale()(
      rightEdgeHit.y
    )}`

    return points
  })
  return (
    <>
      <defs>
        <clipPath id={clipPathId()}>
          <polygon
            clip-path={
              props.previousClipId === undefined
                ? ''
                : `url(#${props.previousClipId})`
            }
            points={polygonPoints()}
          />
        </clipPath>
      </defs>
    </>
  )
}
