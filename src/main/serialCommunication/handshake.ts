import { ReadlineParser, SerialPort } from 'serialport'
import { Device } from '../../types/DevicesStatus'

// timeout period for handshake
const handshakeTimeout = 5000 // ms

const request = 'REQUEST_COORDINATOR_CONNECTION\n'
const response = 'CONFIRM_COORDINATOR_CONNECTION'

/**
 * complete a handshake with a device. rejects if handshake fails
 * @param device
 * @returns
 */
export async function handshake<DeviceType extends Device<'port'>>(
  device: DeviceType
): Promise<DeviceType> {
  // for listening to response
  const parser: ReadlineParser = device.port.pipe(
    new ReadlineParser({ delimiter: '\r\n' })
  )

  return new Promise<DeviceType>((resolve, reject) => {
    // if device does not respond, handhshake fails
    const timeoutTimer = setTimeout(() => {
      parser.removeAllListeners()
      reject(new Error(`${device.port.path} didn't respond to handshake`))
    }, handshakeTimeout)

    // check response from device
    parser.once('data', (line: unknown) => {
      clearTimeout(timeoutTimer)
      parser.removeAllListeners()

      if (typeof line !== 'string') {
        // if response is unknown type reject
        reject(
          new Error(
            `Received data of type ${typeof line} from ${device.port.path}`
          )
        )
        return
      } else if (line !== response) {
        // if response is not valid, reject
        reject(
          new Error(`${device.port.path} responded incorrectly to handshake`)
        )
        return
      }

      // response is valid. resolve handshake
      device.connected = true
      resolve(device)
    })

    // send request to device
    device.port.write(request, (error: unknown) => {
      if (error) {
        // error sending request. handshake fails
        clearTimeout(timeoutTimer)
        parser.removeAllListeners()
        reject(new Error(`Could not write to ${device.port.path}`))
        return
      }
    })
  })
}
