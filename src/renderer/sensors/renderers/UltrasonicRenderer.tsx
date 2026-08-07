import { ConicalBeam } from '../../beams/conical/ConicalBeam.jsx'
import { UltrasonicData } from '../../../types/SensorData.js'
import { SensorContext } from '../../contexts/SensorContext.js'
import { useContextOrThrow } from '../../../util/useContextOrThrow.js'
import { Show } from 'solid-js'

// render graphics used for displaying an ultrasonic sensor and its pings
export const UltrasonicRenderer: UltrasonicData['renderer'] = () => {
  const sensor = useContextOrThrow(SensorContext)
  // ultrasonics only display a beam and no additional ui
  return (
    <>
      {/* beam graphic */}
      <Show when={sensor.data.type === 'ultrasonic'}>
        <ConicalBeam />
      </Show>
    </>
  )
}
