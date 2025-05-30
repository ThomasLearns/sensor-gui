import { Ping } from './Pings'

declare global {
  interface Window {
    electronAPI: {
      onPingReceived: (callback: (ping: Ping) => unknown) => void
    }
  }
}
