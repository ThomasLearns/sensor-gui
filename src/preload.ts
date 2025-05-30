// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { Ping } from './types/Pings'

contextBridge.exposeInMainWorld('electronAPI', {
  onPingReceived: (callback: (ping: Ping) => unknown) =>
    ipcRenderer.on('ping-received', (_, ping) => callback(ping)),
})
