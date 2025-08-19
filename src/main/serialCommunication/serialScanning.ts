// given info about a port, determine if it is connected to

import { SerialPort } from "serialport"
import { devices, pushDeviceListToRenderer } from "./initializeSerial"
import { getErrorMessage } from "../../util/getErrorMessage"
import { closeDevice, connectToCoordinator } from "./connectCoordinator"

// fields used to determine if a device is an Arduino Uno
export const arduinoUnoVendorId = '2341'
export const arduinoUnoProductId = '0043'

// determine if a collection of info about a device represents an Arduino Uno
function isPortForArduinoUno(
  port: Awaited<ReturnType<(typeof SerialPort)['list']>>[number]
) {
  return (
    port.vendorId === arduinoUnoVendorId &&
    port.productId === arduinoUnoProductId
  )
}

// given a list of port paths, remove entries for all paths not listed
function removeOtherDevices(paths: string[]) {
  devices
    // each stored path
    .keys()
    // only get paths not in argument
    .filter((path) => !paths.includes(path))
    // remove each and close if necessary
    .forEach((path) => {
      closeDevice(path)
      devices.delete(path)
    })
}

// check all plugged in devices and return a list
// of the paths for those that are arduino unos
async function scanArduinoDevices() {
  const allPorts = await SerialPort.list()
  const arduinoPorts = allPorts.filter(isPortForArduinoUno)
  const arduinoPaths = arduinoPorts.map((port) => port.path)

  return arduinoPaths
}

// register given device paths with their default connection
// status (disconnected)
function createDeviceEntries(paths: string[]) {
  // mark each as disconnected
  paths
    // ignore paths that already exist
    .filter((path) => !devices.has(path))
    // add entry for path
    .forEach((path) => {
      devices.set(path, { connected: false })
    })

  // make sure the renderer can see these new paths
  pushDeviceListToRenderer()
}

// scan for devices and attempt connection with any that are new
export async function scanAndConnect() {
  try {
    // find plugged in arduino unos
    const arduinoPaths = await scanArduinoDevices()

    // remove old entries for devices that are no longer plugged in
    removeOtherDevices(arduinoPaths)

    // create entries for new devices
    const newPaths = arduinoPaths.filter((path) => !devices.has(path))
    createDeviceEntries(newPaths)

    // attempt connection with each new device
    await Promise.allSettled(newPaths.map((path) => connectToCoordinator(path)))
  } catch (error: unknown) {
    console.debug(
      `Could not scan and connect devices: ${getErrorMessage(error)}`
    )
  }
}
