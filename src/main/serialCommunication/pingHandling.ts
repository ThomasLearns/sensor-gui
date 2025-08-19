import { SlipDecoder, SlipEncoder } from 'serialport'
import { handshakeIndicator } from './connectCoordinator'
import { sendPing } from './initializeSerial'

// byte used to indicate an ASCII message for debug
const debugPacketIndicator = 0x00
// byte used to indicate a data request
const dataRequestIndicator = 0x01
// byte used to indicate a packet of data
const dataIndicator = 0x04
// byte used to indicate the coordinator is done with the current data request
const dataDoneIndicator = 0x05

// send a packet to the device requesting data
export function sendDataRequest(writeParser: SlipEncoder) {
  writeParser.write(Buffer.from([dataRequestIndicator]), (error) => {
    if (error instanceof Error) {
      console.log('failed to send data request')
    }
  })
}

// listen to and handle packets from the connected device
export function setupDataHandlers(
  readParser: SlipDecoder,
  writeParser: SlipEncoder
) {
  readParser.on('data', (packet: unknown) => {
    if (!Buffer.isBuffer(packet)) return
    if (packet.length < 1) return

    // packets' type are determined by the first byte
    switch (packet[0]) {
      case debugPacketIndicator:
        // debug packet
        // print out the packet's content as ASCII
        console.debug(packet.subarray(1).toString())
        break

      case dataIndicator:
        // data packet
        // parse data and send to renderer
        handleData(packet.subarray(1))
        break

      case dataDoneIndicator:
        // data done packet
        // request more data
        sendDataRequest(writeParser)
        break

      case handshakeIndicator:
        // handshake packet
        // not expected at this point, but it is recognized
        // ignore it
        break

      default:
        console.debug('unrecognized data from coordinator')
    }
  })
}

// byte to indicate a data packet represents distance
// <data indicator> <distance indicator> <sensor id> <distance (2 bytes)>
const distanceDataIndicator = 0x00

function handleData(data: Buffer) {
  if (data.length < 1) {
    console.debug('empty data packet received')
    return
  }

  switch (data[0]) {
    // distance data packet
    case distanceDataIndicator:
      if (data.length !== 4) {
        console.debug('malformed distance data packet received')
        return
      }

      // send distance with sensor id to renderer
      const sensorId = data.readUInt8(1)
      const distance = data.readUInt16BE(2)
      sendPing({
        type: 'ultrasonic',
        distance,
        sensorId,
      })

      break

    default:
      console.debug('unrecognized data packet type')
  }
}
