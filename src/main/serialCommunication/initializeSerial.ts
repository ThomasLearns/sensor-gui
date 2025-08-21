import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { Ping } from '../../types/Pings'
import { getErrorMessage } from '../../util/getErrorMessage'
import { SerialPort } from 'serialport'
import { scanAndConnect } from './serialScanning'
import { closeDevice, connectToCoordinator } from './connectCoordinator'

export let sendPing: (ping: Ping) => void
export let sendJam: (typeId: number, sensorId: number) => void

// declared here so it can be initialized later with mainWindow
export let pushDeviceListToRenderer: () => void

// ms between scanning for new devices
const scanInterval = 3000

// setup functions and intervals needed to manage serial devices
export function initializeSerial(mainWindow: BrowserWindow) {
  // define functions for forwarding intentions of serial input to renderer
  sendPing = (ping: Ping) => mainWindow.webContents.send('ping-received', ping)
  sendJam = (typeId: number, sensorId: number) =>
    mainWindow.webContents.send('jam', typeId, sensorId)

  // ensure the renderer knows the most up-to-date version of devices connected
  // to the computer
  pushDeviceListToRenderer = () => {
    mainWindow.webContents.send(
      'update-devices',
      devices.entries().reduce(
        (accumulator, [path, { connected }]) => ({
          ...accumulator,
          [path]: connected,
        }),
        {}
      )
    )
  }

  // every so ofte, check if any more devices have been plugged in
  setInterval(scanAndConnect, scanInterval)

  // when renderer requests toggling the connection of a device,
  // do so then give it an error message (assuming it fails) or resolve
  // with true if it works
  ipcMain.handle(
    'try-set-connection',
    (_event: IpcMainEvent, path: string, connect: boolean) =>
      // set the connection of the target path
      new Promise<true | string>(async (resolve) => {
        try {
          // connect or disconnect from target path
          if (connect) {
            if (!devices.has(path)) {
              // we don't have an entry for this device
              resolve(`${path} not found`)
            }
            // close the device to get it to a known state, then try to connect
            closeDevice(path)
            await connectToCoordinator(path)
          } else {
            // disconnect from device
            closeDevice(path)
          }
        } catch (error) {
          // send the error message to renderer if something went wrong
          resolve(getErrorMessage(error))
          return
        }

        // success
        resolve(true)
      })
  )
}

// keep track of devices plugged in, and whether
// they are connected (we need the port to be able
// to correctly close it if we need to disconnect)
export const devices = new Map<
  string,
  | {
      connected: false
    }
  | {
      connected: true
      port: SerialPort
    }
>()
