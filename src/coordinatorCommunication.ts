import { usb } from 'usb'
import { DeviceConnections } from './types/DevicesStatus'
import { ReadlineParser, SerialPort } from 'serialport'
import { Ping } from './types/Pings'

const arduinoUnoVendorId = '2341'
const arduinoUnoProductId = '0043'

const deviceConnections: DeviceConnections = {}

let updateDeviceConnections: (deviceConnections: DeviceConnections) => unknown
export function SetDeviceUpdateCallback(
  callback: (deviceConnections: DeviceConnections) => unknown
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
    // remove the connection completely, and
    // then reevaluate connected devices (in case
    // reconnection is possible and to update renderer)
    delete deviceConnections[port.path]
    trackExistingPorts()
  }
  port.on('close', handleDisconnect)
  port.on('error', handleDisconnect)
}

// set up an open port to be a coordinator (if it is a coordinator)
async function setupOpenedPort(port: SerialPort) {
  let parser: ReadlineParser
  try {
    // handshake with the coordinator to make sure it is a coordinator
    parser = await establishConnection(port)
  } catch {
    // not a coordinator. mark as not connected
    deviceConnections[port.path] = false
    updateDeviceConnections?.(deviceConnections)
    port.close()
    return
  }

  // mark as connected
  deviceConnections[port.path] = true
  updateDeviceConnections?.(deviceConnections)

  handlePortDisconnect(port)
  parser.on('data', (line) => {
    if (typeof line !== 'string') return
    handleCoordinatorPacket(line.split(','))
  })
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
) {
  const port = new SerialPort(
    { path: portInfo.path, baudRate: 115200 },
    (error) => {
      if (error) return
      setTimeout(() => setupOpenedPort(port), 2000)
    }
  )
}

// attempt connection to each port not already connected
async function trackExistingPorts() {
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
            deviceConnections[port.path] === false)
      )
      // attempt to connect to each arduino uno
      .map((port) => attemptCoordinatorConnection(port))
  )

  // send device connection info to renderer
  updateDeviceConnections?.(deviceConnections)
}
