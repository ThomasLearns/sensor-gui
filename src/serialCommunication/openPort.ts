import { SerialPort } from 'serialport'
import { Device } from './coordinatorCommunication'

// get and store a SerialPort for a device
export function openPort<DeviceType extends Device<'portInfo'>>(
  device: DeviceType
): Promise<DeviceType & Device<'port'>> {
  return new Promise((resolve, reject) => {
    // create serial port
    const port = new SerialPort(
      { path: device.portInfo.path, baudRate: 115200 },
      (error) => {
        if (error) {
          // failed to open serial port
          reject(`Could not connect to ${device.portInfo.path}`)
          return
        }

        // we must use as because we need the return type to specify that
        // port is set, and using a new object literal would mean
        // we wouldn't mutate the existing device (in future)
        device.port = port
        resolve(device as DeviceType & Device<'port'>)
      }
    )
  })
}
