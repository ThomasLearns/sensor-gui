import { DeviceConnections } from './DevicesStatus'
import { Ping } from './Pings'

declare global {
  interface Window {
    electronAPI: {
      onPingReceived: (callback: (ping: Ping) => unknown) => void
      onUpdateDevices: (
        callback: (devices: { [path: string]: boolean }) => unknown
      ) => void
      trySetConnection: (path: string, connected: boolean) => Promise<boolean>
    }
  }
}
