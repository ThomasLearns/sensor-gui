import { ReadlineParser } from 'serialport'
import { sendPing } from '../serialCommunication/initializeSerial'
import { Device } from '../../types/DevicesStatus'
import { jam } from './jam'

export function readPings(device: Device<'port'>) {
  const parser = device.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

  parser.on('data', (line: unknown) => {
    if (typeof line !== 'string') return

    // split the line by commas
    const segments = line.split(',')

    // ignore empty lines
    if (segments.length < 1) return

    // check ping type
    if (segments[0] === '1' && segments.length === 3) {
      // ultrasonic ping received
      sendPing({
        type: 'ultrasonic',
        sensorId: parseInt(segments[1]),
        distance: parseInt(segments[2]),
      })
    } else if (segments[0] === '2' && segments.length === 4) {
      jam(parseInt(segments[2]), parseInt(segments[3]))
    }
  })
}
