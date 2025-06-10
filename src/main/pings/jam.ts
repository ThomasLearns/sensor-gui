import { sendJam } from '../serialCommunication/initializeSerial'

const totalJamTime = 1000 // milliseconds (ms)
const jamInterval = 100 // milliseconds (ms)

// each time a jam ping is received, save its data until the jam time is over
let jamOrders: {
  typeId: number
  sensorId: number
  remainingTime: number
}[] = []

let jamLooping = false

// log a jam order
export function jam(typeId: number, sensorId: number) {
  jamOrders.push({
    typeId,
    sensorId,
    remainingTime: totalJamTime,
  })

  // start jamming if not already started
  if (!jamLooping) {
    jamLooping = true
    jamLoop(performance.now())
  }
}

// loop through the jam orders and send them
function jamLoop(lastTime: number) {
  const currentTime = performance.now()
  jamOrders.forEach((order) => {
    // send jam order and reduce remaining time
    sendJam(order.typeId, order.sensorId)
    order.remainingTime -= currentTime - lastTime
  })

  // remove expired jam orders
  jamOrders = jamOrders.filter((order) => order.remainingTime > 0)

  // jam again after the interval
  setTimeout(() => jamLoop(currentTime), jamInterval)
}
