import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { connectTo } from './connectTo'
import { periodicScan } from './periodicScan'
import { Ping } from '../../types/Pings'
import { Device, Devices } from '../../types/DevicesStatus'
import { disconnectFrom } from './disconnectFrom'

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
      new Promise(async (resolve) => {
        if (connect)
          return await connectTo(path, devices)
            .then(() => resolve(true))
            .catch(() => resolve(false))
        return await disconnectFrom(path, devices)
          .then(() => resolve(true))
          .catch(() => resolve(false))
      }).then((result) => {
        updateDevices(devices)
        return result
      })
  )
}

const devices: Devices = {}
