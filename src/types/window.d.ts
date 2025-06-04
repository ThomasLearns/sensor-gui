import { CageData } from '../contexts/CageContext'
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
      saveCageConfiguration: (cage: CageData) => Promise<boolean>
      loadCageConfiguration: () => Promise<CageData | null>
    }
  }
}
