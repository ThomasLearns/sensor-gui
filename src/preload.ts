// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { Ping } from './types/Pings'
import { DeviceConnections } from './types/DevicesStatus'
import { ReadlineParser, SerialPort } from 'serialport'
import { CageData } from './renderer/contexts/CageContext'

contextBridge.exposeInMainWorld('electronAPI', {
  onPingReceived: (callback: (ping: Ping) => unknown) =>
    ipcRenderer.on('ping-received', (_, ping) => callback(ping)),
  onUpdateDevices: (
    callback: (devices: { [path: string]: boolean }) => unknown
  ) => ipcRenderer.on('update-devices', (_, devices) => callback(devices)),
  trySetConnection: (path: string, connect: boolean) =>
    ipcRenderer.invoke('try-set-connection', path, connect),
  saveCageConfiguration: (cage: CageData) =>
    ipcRenderer.invoke('save-cage', cage),
  loadCageConfiguration: () => ipcRenderer.invoke('load-cage'),
  closeApp: () => ipcRenderer.send('close'),
  onJam: (callback: (typeId: number, sensorId: number) => unknown) =>
    ipcRenderer.on('jam', (_, typeId, sensorId) => callback(typeId, sensorId)),
  toggleMockSensors: (enabled: boolean) =>
    ipcRenderer.invoke('toggle-mock-sensors', enabled), 
})
