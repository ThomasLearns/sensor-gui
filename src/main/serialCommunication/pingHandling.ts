import { SlipDecoder, SlipEncoder } from 'serialport'
import { handshakeIndicator } from './connectCoordinator'
import { sendJam, sendPing } from './initializeSerial'

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
  writeParser: SlipEncoder,
) {
  readParser.on('data', (packet: unknown) => {
    if (!Buffer.isBuffer(packet)) return
    if (packet.length < 1) return

    // packets' type are determined by the first byte
    switch (packet[0]) {
      case debugPacketIndicator:
        // debug packet
        // print out the packet's content as ASCII
        console.debug(`${packet.subarray(1).toString()} from device:`)
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
// byte to indicate a data packet represents being jammed
// <data indicator> <jam indicator> <sensor id> <target sensor type> <target sensor id>
const jamIndicator = 0x01

// Jamming time limit tracking
const MAX_JAM_DURATION = 60000 // 60 seconds in milliseconds
const JAM_SESSION_GAP_THRESHOLD = 1000 // 1 second gap indicates button release

let totalJamTime = 0 // Total accumulated jamming time in milliseconds
let jamSessionStartTime: number | null = null // When current jamming session started
let lastJamPacketTime: number | null = null // Timestamp of last jam packet
let jamSessionEndTimeout: NodeJS.Timeout | null = null // Timeout to detect session end
let canBeJammed = true // Whether jamming is still allowed

function handleData(data: Buffer) {
  if (data.length < 1) {
    console.debug('empty data packet received')
    return
  }

  switch (data[0]) {
    // distance data packet
    case distanceDataIndicator:
      {
        if (data.length !== 4) {
          console.debug('malformed distance data packet received')
          return
        }

        // send distance with sensor id to renderer
        const sensorId = data.readUInt8(1)
        const distance = data.readUInt16LE(2)
        console.debug(sensorId)
        sendPing({
          type: 'ultrasonic',
          distance,
          sensorId,
        })
      }
      break

    case jamIndicator:
      {
        // Check if jamming is already disabled
        if (!canBeJammed) {
          console.debug('jam received but jamming limit exceeded')
          return
        }

        if (data.length !== 4) {
          console.debug('malformed jam data packet received')
          return
        }

        const now = Date.now()

        // Detect if this is a new jamming session (gap detected)
        if (lastJamPacketTime !== null) {
          const timeSinceLastPacket = now - lastJamPacketTime

          if (timeSinceLastPacket > JAM_SESSION_GAP_THRESHOLD) {
            // Button was released and pressed again - start new session
            console.debug(
              `Jamming session gap detected (${timeSinceLastPacket}ms). Starting new session.`,
            )
            jamSessionStartTime = now
          }
        } else {
          // First jam packet ever - start tracking
          jamSessionStartTime = now
        }

        // Update last packet time
        lastJamPacketTime = now

        // Clear any existing timeout for session end detection
        if (jamSessionEndTimeout !== null) {
          clearTimeout(jamSessionEndTimeout)
        }

        // Set a new timeout to detect when jamming session ends (no packets for threshold time)
        jamSessionEndTimeout = setTimeout(() => {
          if (jamSessionStartTime !== null && lastJamPacketTime !== null) {
            const sessionDuration = lastJamPacketTime - jamSessionStartTime
            totalJamTime += sessionDuration
            console.debug(
              `Jamming session ended. Session duration: ${sessionDuration}ms, Total jam time: ${totalJamTime}ms`,
            )
            jamSessionStartTime = null
          }
        }, JAM_SESSION_GAP_THRESHOLD)

        // Check if we would exceed the limit with this jam packet
        if (
          jamSessionStartTime !== null &&
          totalJamTime + (now - jamSessionStartTime) >= MAX_JAM_DURATION
        ) {
          console.debug(
            `Max jamming duration (${MAX_JAM_DURATION}ms) exceeded. Disabling jamming.`,
          )
          canBeJammed = false

          // Clean up
          if (jamSessionEndTimeout !== null) {
            clearTimeout(jamSessionEndTimeout)
            jamSessionEndTimeout = null
          }
          return
        }

        // send jam info to renderer
        const targetType = data.readUInt8(2)
        const targetId = data.readUInt8(3)
        sendJam(targetType, targetId)
      }
      break

    default:
      console.debug(`unrecognized data packet type ${data[0]}`)
  }
}