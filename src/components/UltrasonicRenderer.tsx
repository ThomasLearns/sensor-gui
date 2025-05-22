import { useContextOrThrow } from '../util/useContextOrThrow'
import { UltrasonicData } from '../types/SensorData'
import { SensorContext } from '../contexts/SensorContext'
import { GridContext } from '../contexts/GridContext'
import { CageContext } from '../contexts/CageContext'
import { Beam } from './Beam'
import { metersPerFoot } from '../util/mathConstants'
import { getXYProjectedRadius } from '../util/getXYProjectedRadius'

// render graphics used for displaying an ultrasonic sensor and its pings
export const UltrasonicRenderer: UltrasonicData['renderer'] = () => {
  // ultrasonics only display a beam and no additional ui
  return (
    <>
      {/* beam graphic */}
      <Beam />
    </>
  )
}
