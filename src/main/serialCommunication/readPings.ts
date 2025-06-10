import { ReadlineParser } from 'serialport'
import { sendPing } from './initializeSerial'
import { Device } from '../../types/DevicesStatus'

export function readPings(device: Device<'port'>) {
  const parser = device.port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

  parser.on('data', (line: unknown) => {
    if (typeof line !== 'string') return
    const segments = line.split(',')
    if (segments.length < 1) return
    if (segments[0] === '1' && segments.length === 3) {
      sendPing({
        type: 'ultrasonic',
        sensorId: parseInt(segments[1]),
        distance: parseInt(segments[2]),
      })
    }
  })
}
