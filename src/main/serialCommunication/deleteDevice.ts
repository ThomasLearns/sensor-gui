import { Device } from '../../types/DevicesStatus'

export function deleteDevice(
  devices: { [path: string]: Device },
  path: string
) {
  try {
    devices[path].parser?.removeAllListeners()
    if (!devices[path].port?.closed) {
      devices[path].port?.close(() => {})
    }
  } catch {}
  delete devices[path]
}
