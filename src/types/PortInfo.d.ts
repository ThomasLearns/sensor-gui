// describe information about a serial port
export type PortInfo = Awaited<ReturnType<(typeof SerialPort)['list']>>[number]
