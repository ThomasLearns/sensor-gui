import { useContextOrThrow } from '../util/useContextOrThrow'
import { UltrasonicData } from '../types/SensorData'
import { SensorContext } from '../contexts/SensorContext'
import { GridContext } from '../contexts/GridContext'
import { CageContext } from '../contexts/CageContext'
import { Beam } from './Beam'

// render graphics used for displaying an ultrasonic sensor and its pings
export const UltrasonicRenderer: UltrasonicData['renderer'] = (props) => {
  // unimplemented
  props.handlePing = (disatance: number) => {}

  return (
    <>
      {/* beam graphic */}
      <Beam />
    </>
  )
}
