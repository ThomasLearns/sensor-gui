import { UltrasonicData } from '../types/SensorData'
import { ConicalBeam } from './ConicalBeam'

// render graphics used for displaying an ultrasonic sensor and its pings
export const UltrasonicRenderer: UltrasonicData['renderer'] = () => {
  // ultrasonics only display a beam and no additional ui
  return (
    <>
      {/* beam graphic */}
      <ConicalBeam />
    </>
  )
}
