import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { ReadlineParser, SerialPort } from 'serialport'
import { handshake } from './handshake'
import { openPort } from './openPort'
import { connectTo } from './connectTo'
import { periodicScan } from './periodicScan'
import { deleteDevice } from './deleteDevice'
import { Ping } from '../../types/Pings'
import { Device, Devices } from '../../types/DevicesStatus'
import { disconnectFrom } from './disconnectFrom'

export let sendPing: (ping: Ping) => void

export function initializeSerial(mainWindow: BrowserWindow) {
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

  sendPing = (ping: Ping) => mainWindow.webContents.send('ping-received', ping)

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
