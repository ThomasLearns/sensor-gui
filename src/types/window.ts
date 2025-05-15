// define types for ipc functions added onto the window object
declare global {
  interface Window {
    electronAPI?: {
      onCenterFrequencyChange: (
        callback: (frequency: number) => unknown
      ) => unknown
    }
  }
}
