import { ReadlineParser } from 'serialport'
import { sendJam, sendPing } from '../serialCommunication/initializeSerial'
import { Device } from '../../types/DevicesStatus'

export function readPings(device: Device<'port'>) {
  const parser: ReadlineParser = device.port.pipe(
    new ReadlineParser({ delimiter: '\r\n' })
  )
  device.parser = parser

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
    } else if (segments[0] === '3' && segments.length === 4) {
      // send a jam packet
      sendJam(parseInt(segments[2]), parseInt(segments[3]))
    }

    // without this line, eventually this event callback will stop being called.
    // I don't know why. Details on this solution may be found here:
    // https://github.com/serialport/node-serialport/issues/2117
    device.port.resume()
  })
}
