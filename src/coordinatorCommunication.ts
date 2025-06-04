import { usb } from 'usb'
import { DeviceConnections } from './types/DevicesStatus'
import { ReadlineParser, SerialPort } from 'serialport'
import { Ping } from './types/Pings'
import { ipcMain, IpcMainInvokeEvent } from 'electron'

const arduinoUnoVendorId = '2341'
const arduinoUnoProductId = '0043'

const deviceConnections: {
  [path: string]: {
    connected: boolean
    port: SerialPort
    parser: ReadlineParser | undefined
  }
} = {}

let updateDeviceConnections: (deviceConnections: {
  [path: string]: {
    connected: boolean
    port: SerialPort
    parser: ReadlineParser | undefined
  }
}) => unknown
export function SetDeviceUpdateCallback(
  callback: (deviceConnections: {
    [path: string]: {
      connected: boolean
      port: SerialPort
      parser: ReadlineParser | undefined
    }
  }) => unknown
) {
  updateDeviceConnections = callback
}

let sendPingToRenderer: (ping: Ping) => unknown
export function SetPingCallback(callback: (ping: Ping) => unknown) {
  sendPingToRenderer = callback
}

export function initializeSerial() {
  usb.on('attach', async () => setTimeout(trackExistingPorts, 500))
  usb.on('detach', async () => setTimeout(trackExistingPorts, 500))

  ipcMain.handle('try-set-connection', handleTrySetConnection)

  trackExistingPorts()
}

// complete a handshake with an uno to confirm it is a coordinator
function establishConnection(port: SerialPort) {
  return new Promise<ReadlineParser>((resolve, reject) => {
    // set up a parser for communicating
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))

    // after a timout period, assume it is not a coordinator
    const timeoutTimer = setTimeout(() => {
      parser.removeAllListeners()
      reject()
    }, 5000)

    // on the next line from the uno, check if its a handshake response
    parser.once('data', (line) => {
      clearTimeout(timeoutTimer)
      if (line === 'CONFIRM_COORDINATOR_CONNECTION') {
        resolve(parser)
      } else {
        // the handshake failed
        parser.removeAllListeners()
        reject()
      }
    })

    // send a handshake request
    port.write('REQUEST_COORDINATOR_CONNECTION\n', (error) => {
      // could not send request. failed connection
      if (error) {
        clearTimeout(timeoutTimer)
        parser.removeAllListeners()
        reject()
      }
    })
  })
}

// when an open port disconnects, handle it
function handlePortDisconnect(port: SerialPort) {
  const handleDisconnect = () => {
    delete deviceConnections[port.path]
    // remove the connection completely, and
    // then reevaluate connected devices (in case
    // reconnection is possible and to update renderer)
    // trackExistingPorts()
  }
  port.on('close', handleDisconnect)
  port.on('error', handleDisconnect)
}

// set up an open port to be a coordinator (if it is a coordinator)
async function setupOpenedPort(port: SerialPort): Promise<boolean> {
  let parser: ReadlineParser
  try {
    // handshake with the coordinator to make sure it is a coordinator
    parser = await establishConnection(port)
  } catch {
    // not a coordinator. mark as not connected
    deviceConnections[port.path].connected = false
    updateDeviceConnections?.(deviceConnections)
    port.close()
    return false
  }

  // mark as connected
  deviceConnections[port.path].connected = true
  deviceConnections[port.path].parser = parser
  updateDeviceConnections?.(deviceConnections)

  handlePortDisconnect(port)
  parser.on('data', (line) => {
    if (typeof line !== 'string') return
    handleCoordinatorPacket(line.split(','))
  })
  return true
}

function handleCoordinatorPacket(packet: string[]) {
  if (packet.length < 1) return
  if (packet[0] === '1' && packet.length === 3) {
    sendPingToRenderer?.({
      type: 'ultrasonic',
      sensorId: parseInt(packet[1]),
      distance: parseInt(packet[2]),
    })
  }
}

// attempt connection to an arduino uno if it is a coordinator
async function attemptCoordinatorConnection(
  portInfo: Awaited<ReturnType<(typeof SerialPort)['list']>>[number]
): Promise<boolean> {
  return new Promise((resolve) => {
    const port = new SerialPort(
      { path: portInfo.path, baudRate: 115200 },
      (error) => {
        if (error) {
          resolve(false)
          return
        }
        setTimeout(async () => {
          const cleanup = await setupOpenedPort(port)
          if (cleanup) {
            resolve(true)
          } else {
            resolve(false)
          }
        }, 2000)
      }
    )
    deviceConnections[port.path] = { port, connected: false, parser: undefined }
  })
}

// attempt connection to each port not already connected
async function trackExistingPorts() {
  console.log('track called')
  // get ports available
  const ports = await SerialPort.list()
  await Promise.allSettled(
    ports
      .filter(
        // filter ports to those that are arduino unos
        (port) =>
          port.vendorId?.toLowerCase() === arduinoUnoVendorId &&
          port.productId?.toLowerCase() === arduinoUnoProductId &&
          // filter out ports that we are already connected to
          (!(port.path in deviceConnections) ||
            deviceConnections[port.path].connected === false)
      )
      // attempt to connect to each arduino uno
      .map((port) => attemptCoordinatorConnection(port))
  )

  // send device connection info to renderer
  updateDeviceConnections?.(deviceConnections)
}

async function handleTrySetConnection(
  event: IpcMainInvokeEvent,
  path: string,
  connect: boolean
): Promise<boolean> {
  const targetPorts = (await SerialPort.list()).filter(
    (port) => port.path === path
  )
  console.log(targetPorts)
  console.log(connect)
  if (targetPorts.length !== 1) return false

  if (connect) {
    const connected = await attemptCoordinatorConnection(targetPorts[0])
    updateDeviceConnections?.(deviceConnections)
    return connected
  } else {
    try {
      deviceConnections[path].port.close()
      deviceConnections[path].parser?.removeAllListeners()
      deviceConnections[path].connected = false
      updateDeviceConnections?.(deviceConnections)
      return true
    } catch {
      console.log('failed to disconnect')
      updateDeviceConnections?.(deviceConnections)
      return false
    }
  }
}
