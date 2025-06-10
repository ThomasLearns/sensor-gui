import { SerialPort } from 'serialport'
import { PortInfo } from '../../types/PortInfo'

export const arduinoUnoVendorId = '2341'
const arduinoUnoProductId = '0043'
export async function getTargetPorts(): Promise<PortInfo[]> {
  const targetPorts = (await SerialPort.list()).filter(
    (port) =>
      port.vendorId?.toLowerCase() === arduinoUnoVendorId &&
      port.productId?.toLowerCase() === arduinoUnoProductId
  )

  return targetPorts
}
