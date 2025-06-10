import { Device } from '../../types/DevicesStatus'
import { handshake } from './handshake'
import { openPort } from './openPort'
import { readPings } from './readPings'

export async function connectTo(
  path: string,
  devices: { [path: string]: Device }
): Promise<Device> {
  if (!(path in devices)) throw new Error(`No disconnected device at ${path}`)

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
}
