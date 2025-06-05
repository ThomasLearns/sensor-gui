import { BrowserWindow, ipcMain, IpcMainEvent } from 'electron'
import { ReadlineParser, SerialPort } from 'serialport'
import { handshake } from './handshake'
import { openPort } from './openPort'
import { connectTo } from './connectTo'
import { periodicScan } from './periodicScan'
import { deleteDevice } from './deleteDevice'
import { Ping } from 'src/types/Pings'

export type PortInfo = Awaited<ReturnType<(typeof SerialPort)['list']>>[number]

export let sendPing = (ping: Ping) => {}

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

type BaseDevice = {
  portInfo: PortInfo
  connected: boolean
  port?: SerialPort
  parser?: ReadlineParser
}
export type Device<RequiredFields extends keyof BaseDevice | void = void> =
  RequiredFields extends keyof BaseDevice
    ? BaseDevice & {
        [Key in RequiredFields]: NonNullable<BaseDevice[Key]>
      }
    : BaseDevice
const devices: {
  [path: string]: Device
} = {}

async function disconnectFrom(
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
