import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { connectTo } from './connectTo'
import { periodicScan } from './periodicScan'
import { Ping } from '../../types/Pings'
import { Device, Devices } from '../../types/DevicesStatus'
import { disconnectFrom } from './disconnectFrom'
import { getErrorMessage } from '../../util/getErrorMessage'

export let sendPing: (ping: Ping) => void
export let sendJam: (typeId: number, sensorId: number) => void

export function initializeSerial(mainWindow: BrowserWindow) {
  sendPing = (ping: Ping) => mainWindow.webContents.send('ping-received', ping)
  sendJam = (typeId: number, sensorId: number) =>
    mainWindow.webContents.send('jam', typeId, sensorId)

  const updateDevices = (devices: { [path: string]: Device }) =>
    mainWindow.webContents.send(
      'update-devices',
      Object.entries(devices).reduce(
        (acc, [path, details]) => ({
          ...acc,
          [path]: details.connected,
        }),
        {}
      )
    )

  periodicScan(updateDevices, devices)

  ipcMain.handle(
    'try-set-connection',
    (event: IpcMainEvent, path: string, connect: boolean) =>
      // set the connection of the target path
      new Promise<true | string>(async (resolve) => {
        try {
          // connect or disconnect from target path
          if (connect) await connectTo(path, devices)
          else await disconnectFrom(path, devices)
        } catch (error) {
          // send the error message to renderer if something went wrong
          resolve(getErrorMessage(error))
          return
        }

        // success
        resolve(true)
      }).then((result) => {
        // update the connection status after whatever operation (if any) was accomplished
        updateDevices(devices)
        return result
      })
  )
}

const devices: Devices = {}
