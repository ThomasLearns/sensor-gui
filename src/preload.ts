// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { Ping } from './types/Pings'
import { DeviceConnections } from './types/DevicesStatus'

contextBridge.exposeInMainWorld('electronAPI', {
  onPingReceived: (callback: (ping: Ping) => unknown) =>
    ipcRenderer.on('ping-received', (_, ping) => callback(ping)),
  onUpdateDevices: (Callback: (devices: DeviceConnections) => unknown) =>
    ipcRenderer.on('update-devices', (_, devices) => Callback(devices)),
})
