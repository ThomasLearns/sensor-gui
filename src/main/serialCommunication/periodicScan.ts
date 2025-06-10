import { Device } from '../../types/DevicesStatus'
import { connectTo } from './connectTo'
import { deleteDevice } from './deleteDevice'
import { getTargetPorts } from './getTargetPorts'

const scanInterval = 2000
export async function periodicScan(
  callback: (devices: { [path: string]: Device }) => unknown,
  devices: { [path: string]: Device }
) {
  const targetPorts = await getTargetPorts()

  const trackedPaths = Object.keys(devices)
  trackedPaths.forEach((path) => {
    if (!targetPorts.map((port) => port.path).includes(path)) {
      deleteDevice(devices, path)
    }
  })

  const newPorts = targetPorts.filter((port) => !(port.path in devices))

  newPorts.forEach((port) => {
    devices[port.path] = { connected: false, portInfo: port }
  })

  await Promise.allSettled(
    newPorts.map((port) => connectTo(port.path, devices))
  )

  callback(devices)
  setTimeout(() => periodicScan(callback, devices), scanInterval)
}
