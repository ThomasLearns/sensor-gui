import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { Ping } from '../../types/Pings'
import { getErrorMessage } from '../../util/getErrorMessage'
import { SerialPort, SlipDecoder, SlipEncoder } from 'serialport'
import { scanAndConnect } from './serialScanning'
import { closeDevice, connectToCoordinator } from './connectCoordinator'
import { UltrasonicSensorsMock } from './UltrasonicSensorsMock'

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
        {},
      ),
    )
  }

  // every so ofte, check if any more devices have been plugged in
  setInterval(scanAndConnect, scanInterval)

  // when renderer requests toggling the connection of a device,
  // do so then give it an error message (assuming it fails) or resolve
  // with true if it works
  ipcMain.handle(
    'try-set-connection',
    (_event: IpcMainInvokeEvent, path: string, connect: boolean) =>
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
      }),
  )
  // Track the active mock instance
  let activeMockSensors: UltrasonicSensorsMock | null = null

  ipcMain.handle('toggle-mock-sensors', async (event, enabled: boolean) => {
    try {
      console.log(`Toggle mock sensors: ${enabled}`)
      console.log(`Connected devices: ${devices.size}`)
      
      if (enabled) {
        if (activeMockSensors?.isSimulationRunning()) {
          return { success: false, message: 'Mock sensors already running' }
        }

        for (const [path, device] of devices.entries()) {
          console.log(`Device ${path}: connected=${device.connected}, hasReadParser=${!!(device as any).readParser}`)
          
          if (device.connected && (device as any).readParser) {
            activeMockSensors = new UltrasonicSensorsMock()
            activeMockSensors.setReadParser((device as any).readParser)
            activeMockSensors.startSimulation()
            console.log('Mock sensors enabled')
            return { success: true, message: 'Mock sensors enabled' }
          }
        }
        return { success: false, message: `No connected device found (${devices.size} devices total)` }
      } else {
        if (activeMockSensors) {
          activeMockSensors.stopSimulation()
          activeMockSensors = null
          console.log('Mock sensors disabled')
        }
        return { success: true, message: 'Mock sensors disabled' }
      }
    } catch (error) {
      console.error('Mock toggle error:', error)
      return { success: false, message: getErrorMessage(error) }
    }
  })
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
      writeParser: SlipEncoder
      readParser: SlipDecoder
    }
>()
