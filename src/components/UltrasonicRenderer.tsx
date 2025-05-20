import { useContextOrThrow } from '../util/useContextOrThrow'
import { UltrasonicData } from '../types/SensorData'
import { SensorContext } from '../contexts/SensorContext'
import { GridContext } from '../contexts/GridContext'
import { createMemo, For } from 'solid-js'
import { CageContext } from '../contexts/CageContext'

const measuringAngle = 15 // degrees
const feetPerMeter = 0.3048

// render graphics used for displaying an ultrasonic sensor and its pings
export const UltrasonicRenderer: UltrasonicData['renderer'] = (props) => {
  const cage = useContextOrThrow(CageContext)
  const grid = useContextOrThrow(GridContext)
  const sensor = useContextOrThrow(SensorContext)

  // unimplemented
  props.handlePing = (disatance: number) => {}

  // ids of clip-path svg elements for forming the shapes
  // clips beam at max range
  const getMaxRangeClipPathId = createMemo(
    () => `clip-path-range${sensor.index()}`
  )
  // clips pings and contour lines at the sides of the beam
  const getSideOfBeamClipPathId = createMemo(
    () => `clip-path-side${sensor.index()}`
  )

  // an array of each corner and its distance clockwise along the edge from
  // the bottom left. Includes 2 laps of the cage
  const corners = (() => {
    const normalCorners = [
      { x: 0, y: 0, distance: 0 },
      { x: 0, y: cage.height, distance: cage.height },
      { x: cage.width, y: cage.height, distance: cage.height + cage.width },
      { x: cage.width, y: 0, distance: 2 * cage.height + cage.width },
    ]
    // append to the list a 2nd lap before returning
    return normalCorners.concat(
      normalCorners.map((corner) => ({
        ...corner,
        distance: corner.distance + 2 * cage.height + 2 * cage.width,
      }))
    )
  })()

  // given a point (feet) on the cage edge, get the distance from the bottom left
  // corner following the edges clockwise
  function getPerimiterDistance(x: number, y: number) {
    // ensure the point is on an edge
    if (x !== 0 && x !== cage.width && y !== 0 && y !== cage.height)
      throw new Error(
        `Cannot get perimiter distance of point not on edge: (${x},${y})`
      )

    // determine the edge the point is on and calculate
    // the perimeter distance between the bottom left and it
    return x === 0
      ? y
      : y === cage.height
      ? cage.height + x
      : x === cage.width
      ? cage.height + cage.width + (cage.height - y)
      : 2 * cage.height + cage.width + (cage.width - x)
  }

  // given a point (feet) inside the cage and an angle (radians), return the
  // point where a line from that point would hit the edge of the cage
  function getBorderHit(
    x: number,
    y: number,
    angle: number
  ): { x: number; y: number } {
    // get the components of the angle
    const xComponent = Math.cos(angle)
    const yComponent = Math.sin(angle)

    // if the point is on an edge and the angle
    // points into the same edge, simply return
    // the input point
    if (
      (x === 0 && xComponent < 0) ||
      (x === cage.width && xComponent > 0) ||
      (y === 0 && yComponent < 0) ||
      (y === cage.height && yComponent > 0)
    )
      return { x, y }

    // for each edge, check to see if the angle would have a line hit it
    if (x > 0 && xComponent < 0) {
      const yOnLeftBorder = y + yComponent * (x / Math.abs(xComponent))
      if (yOnLeftBorder <= cage.height && yOnLeftBorder >= 0)
        return { x: 0, y: yOnLeftBorder }
    }

    if (x < cage.width && xComponent > 0) {
      const yOnRightBorder =
        y + yComponent * ((cage.width - x) / Math.abs(xComponent))
      if (yOnRightBorder <= cage.height && yOnRightBorder >= 0)
        return { x: cage.width, y: yOnRightBorder }
    }

    if (y > 0 && yComponent < 0) {
      const xOnBottomBorder = x + xComponent * (y / Math.abs(yComponent))
      if (xOnBottomBorder <= cage.width && xOnBottomBorder >= 0)
        return { x: xOnBottomBorder, y: 0 }
    }

    if (y < cage.height && yComponent > 0) {
      const xOnTopBorder =
        x + xComponent * ((cage.height - y) / Math.abs(yComponent))
      if (xOnTopBorder <= cage.width && xOnTopBorder >= 0)
        return { x: xOnTopBorder, y: cage.height }
    }

    throw new Error(`Could not trace sensor beam to edge of cage`)
  }

  // the "points" string for the polygon representing the sensor's beam
  const polygonPoints = createMemo<string>(() => {
    // sensor position in pixels
    const gridX = grid.getXScale()(sensor.data.xFeet)
    const gridY = grid.getYScale()(sensor.data.yFeet)

    // get the bounding angles of the beam
    const leftAngle =
      ((sensor.data.horizontalAngle + measuringAngle / 2) * Math.PI) / 180
    const rightAngle =
      ((sensor.data.horizontalAngle - measuringAngle / 2) * Math.PI) / 180

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
      rightPerimiterDistance += 2 * cage.width + 2 * cage.height
    }

    corners
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

  // the projection radius finder is a function that, given a target radius
  // in meters of the sensor's beam, will find that same radius projected on the xy plane
  // (without the z component)
  const getProjectionRadiusFinder = createMemo(() => (meters: number) => {
    // convert meters to feet, then pixels
    const distancePixels = (grid.pixelsPerFoot * meters) / feetPerMeter
    // convert horizontal angle to radians to get theta
    const theta = (sensor.data.horizontalAngle * Math.PI) / 180
    // phi is the angle from the positive z axis.
    // convert the vertical angle to phi
    const phi = (-(sensor.data.verticalAngle + 90) * Math.PI) / 180

    // get the x and y of the point on the sensor's beam at the
    // specified radius
    const x = distancePixels * Math.cos(theta) * Math.sin(phi)
    const y = distancePixels * Math.sin(theta) * Math.sin(phi)

    // get the radius (ignoring z) to that xy point
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  })

  return (
    <>
      <g class="fill-secondary pointer-events-none">
        <defs>
          <clipPath id={getMaxRangeClipPathId()}>
            <circle
              r={`${getProjectionRadiusFinder()(4)}px`}
              cx={grid.getXScale()(sensor.data.xFeet)}
              cy={grid.getYScale()(sensor.data.yFeet)}
            />
          </clipPath>
          <clipPath id={getSideOfBeamClipPathId()}>
            <polygon points={polygonPoints()} />
          </clipPath>
        </defs>
        <polygon
          fill-opacity="0.2"
          points={polygonPoints()}
          clip-path={`url(#${getMaxRangeClipPathId()})`}
        />
        <g class="fill-none stroke-secondary-content">
          <For
            each={(() => {
              const a = new Array(
                Math.floor(
                  (4 / feetPerMeter) *
                    Math.abs(
                      Math.cos(
                        (-(sensor.data.verticalAngle + 90) * Math.PI) / 180
                      )
                    )
                )
              )
              return a
            })()}
          >
            {(_, index) => (
              <circle
                r={`${getProjectionRadiusFinder()(
                  (feetPerMeter * (index() + 1)) /
                    Math.cos(
                      (-(sensor.data.verticalAngle + 90) * Math.PI) / 180
                    )
                )}px`}
                stroke-width="2"
                cx={`${grid.getXScale()(sensor.data.xFeet)}px`}
                cy={`${grid.getYScale()(sensor.data.yFeet)}px`}
                clip-path={`url(#${getSideOfBeamClipPathId()})`}
              />
            )}
          </For>
        </g>
      </g>
    </>
  )
}
