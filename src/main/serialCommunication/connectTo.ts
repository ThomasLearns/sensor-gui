import { Device } from '../../types/DevicesStatus'
import { handshake } from './handshake'
import { openPort } from './openPort'
import { readPings } from '../pings/readPings'
import { disconnectFrom } from './disconnectFrom'

export async function connectTo(
  path: string,
  devices: { [path: string]: Device }
): Promise<Device> {
  if (!(path in devices)) throw new Error(`No available device at ${path}`)

  const device = devices[path]
  return openPort(device)
    .then(
      (device) =>
        new Promise((resolve) => setTimeout(() => resolve(device), 2000))
    )
    .then(handshake)
    .then((device) => {
      readPings(device)
      return device
    })
    .catch((error) => {
      // if anything goes wrong, clean up the connection before throwing

      // remove parser if it exists
      device.parser?.removeAllListeners()
      delete device.parser

      // close port if it exists
      device.port?.close()

      // mark as disconnected
      device.connected = false

      throw error
    })
}
