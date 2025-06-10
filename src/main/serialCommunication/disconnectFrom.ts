import { Device } from '../../types/DevicesStatus'

export async function disconnectFrom(
  path: string,
  devices: { [path: string]: Device }
): Promise<void> {
  if (!(path in devices) || !devices[path].connected) {
    throw new Error(`${path} is not connected`)
  }

  // deleteDevice(devices, path)
  const device = devices[path]
  device.parser?.removeAllListeners()
  delete device.parser
  device.port?.close(() => {})
  delete device.port
  device.connected = false
}
