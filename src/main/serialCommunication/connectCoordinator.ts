import { SerialPort, SlipDecoder, SlipEncoder } from 'serialport'
import { devices, pushDeviceListToRenderer } from './initializeSerial'
import { sendDataRequest, setupDataHandlers } from './pingHandling'

// must be the same as the baud rate set on the coordinator
const baudRate = 115200

// ms to delay after opening a port to give the device time to start up
const portOpenDelay = 2000

// ms to wait for a handshake to complete before assuming it failed
const handshakeTimeout = 5000

// byte used to indicate a handshake packet
export const handshakeIndicator = 0x06

// disconnect a device (if it is connected)
export function closeDevice(path: string, port?: SerialPort) {
  // look for a device matching the path
  const device = devices.get(path)

  // if the device is connected, close the port
  if (device?.connected) {
    device.port.close()
    device.port.destroy()
  }

  // if there is an associated port (used when the connection didn't complete before failing)
  // close the port
  if (port !== undefined) {
    port.close()
    port.destroy()
  }

  // if the device is a real device plugged in, set its entry
  // to a disconnected state
  if (device !== undefined) {
    devices.set(path, { connected: false })
  }

  pushDeviceListToRenderer()
}

// open a serialport connection with the device path
async function setupCoordinatorPort(path: string) {
  return new Promise<SerialPort>((resolve, reject) => {
    // open the port
    const port = new SerialPort(
      // port configuration
      {
        baudRate,
        path,
      },
      // on completion (note: still wait a few to avoid issues)
      (error) => {
        // if it failed, reject
        if (error !== null) reject(error)

        // wait a few seconds to allow the arduino to start up
        setTimeout(() => {
          resolve(port)
        }, portOpenDelay)
      }
    )

    // register some listeners to try to cleanly close the port if
    // something goes wrong
    port.on('close', () => {
      closeDevice(path)
    })
    port.on('error', () => {
      closeDevice(path)
    })
  })
}

// create parsers for reading and writing connected to the port
function createSlipParsers(port: SerialPort) {
  // create a parser for reading data from the port
  const readParser = new SlipDecoder()
  port.pipe(readParser)

  // create a parser for writing data to the port
  const writeParser = new SlipEncoder()
  writeParser.pipe(port)

  return { readParser, writeParser }
}

// send a handshake packet to the device, and reject if it
// doesn't respond with another handshake packet
async function handshake(readParser: SlipDecoder, writeParser: SlipEncoder) {
  return new Promise<void>((resolve, reject) => {
    // after a timeout period, we can assume the handshake failed
    const timeoutId = setTimeout(() => {
      reject('Handshake timed out')
    }, handshakeTimeout)

    // listener for responses from the device
    const handshakeListener = (packet: unknown) => {
      if (!Buffer.isBuffer(packet)) return

      // if the packet received is a handshake packet,
      // handshake succeeded
      if (packet.length === 1 && packet[0] === handshakeIndicator) {
        // success
        resolve()
        // cleanup listener and stop waiting for handshake to timeout
        readParser.removeListener('data', handshakeListener)
        clearTimeout(timeoutId)
      }
    }
    // register the listener
    readParser.on('data', handshakeListener)

    // send a handshae to the device
    writeParser.write(Buffer.from([handshakeIndicator]), (error) => {
      if (error instanceof Error) reject(error.message)
    })
  })
}

// add/change an entry in the device list to be a connected
// entry with the port included
function savePort(port: SerialPort, writeParser: SlipEncoder, readParser: SlipDecoder) {
  devices.set(port.path, {
    connected: true,
    port,
    writeParser,
    readParser,
  })
}

// try to connect to a device
export async function connectToCoordinator(path: string) {
  let port: SerialPort | undefined
 
  try {
    // open a port
    port = await setupCoordinatorPort(path)
    
    const { readParser, writeParser } = createSlipParsers(port)
    
    // complete a handshake
    await handshake(readParser, writeParser)

    // listen and handle packets from device
    setupDataHandlers(readParser, writeParser)

    // mark device as saved
    savePort(port, writeParser, readParser)

    // start communication by sending first data request
    sendDataRequest(writeParser)

    // update renderer with most up-to-date list of device statuses
    pushDeviceListToRenderer()
  } catch (error) {
    // close the device and cleanup due to failure
    closeDevice(path, port)
    throw error
  }
}
