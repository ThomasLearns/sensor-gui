// used in the renderer to see which devices are connected
export type DeviceConnections = {
  [path: string]: boolean
}

// a device is a serial port with some additional information
type BaseDevice = {
  portInfo: PortInfo
  connected: boolean
  port?: SerialPort
  parser?: ReadlineParser
}

// a device with specied required fields
export type Device<RequiredFields extends keyof BaseDevice | void = void> =
  RequiredFields extends keyof BaseDevice
    ? BaseDevice & {
        [Key in RequiredFields]: NonNullable<BaseDevice[Key]>
      }
    : BaseDevice

// a collection of devices, indexed by their path
export type Devices = {
  [path: string]: Device
}
