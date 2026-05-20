import { SlipDecoder } from 'serialport'

/**
 * Represents a mock ultrasonic sensor with position and orientation
 */
interface MockSensor {
  id: number
  xFeet: number
  yFeet: number
  zFeet: number
  horizontalAngle: number
  verticalAngle: number
  measuringAngle: number
  maxRange: number
  baseDistance: number // base distance for this sensor (can vary)
  variance: number // random variance in distance readings
}

/**
 * Configuration for the ultrasonic sensors mock
 */
interface UltrasonicSensorsMockConfig {
  sensorCount: number
  simulationInterval: number // ms between pings
  maxRange: number // maximum sensor range in cm
  variance: number // percentage variance in readings
  minDistance: number // minimum distance in cm
  maxDistance: number // maximum distance in cm for this simulation
  cageWidth: number // cage dimensions in feet
  cageHeight: number
  cageDepth: number
}

/**
 * Mock class that simulates ~99 ultrasonic sensors sending distance data packets
 * Can be used to test the sensor GUI without actual hardware
 *
 * Packet format (as understood from pingHandling.ts):
 * <data indicator: 0x04> <distance indicator: 0x00> <sensor id: uint8> <distance: uint16 LE>
 */
export class UltrasonicSensorsMock {
  private sensors: MockSensor[] = []
  private config: UltrasonicSensorsMockConfig
  private simulationInterval: NodeJS.Timeout | null = null
  private isRunning: boolean = false
  private currentPingIndex: number = 0
  private readParser: SlipDecoder | null = null

  constructor(config: Partial<UltrasonicSensorsMockConfig> = {}) {
    this.config = {
      sensorCount: 99,
      simulationInterval: 1, // 50ms between pings (20 Hz)
      maxRange: 400, // 4 meters
      variance: 0.05, // 5% variance
      minDistance: 10, // 10 cm minimum
      maxDistance: 350, // 3.5 meters max for simulation
      cageWidth: 10,
      cageHeight: 10,
      cageDepth: 10,
      ...config,
    }

    this.initializeSensors()
  }

  // New method to set the parser for sending mock data
  public setReadParser(readParser: SlipDecoder): void {
    this.readParser = readParser
  }
  
  /**Tha
   * Initialize the mock sensors with random positions and orientations
   */
  private initializeSensors(): void {
    this.sensors = []

    for (let i = 1; i <= this.config.sensorCount; i++) {
      const sensor: MockSensor = {
        id: i,
        // Random positions within the cage
        xFeet: Math.random() * this.config.cageWidth,
        yFeet: Math.random() * this.config.cageHeight,
        zFeet: Math.random() * this.config.cageDepth,

        // Random orientations (0-360 degrees)
        horizontalAngle: Math.random() * 360,
        verticalAngle: Math.random() * 360,

        // Measuring angle for ultrasonic beam (typically 15-20 degrees)
        measuringAngle: 15 + Math.random() * 5,

        // Maximum range for this sensor
        maxRange: this.config.maxRange,

        // Base distance (simulates having an object at a certain distance)
        baseDistance:
          this.config.minDistance +
          Math.random() *
            (this.config.maxDistance - this.config.minDistance),

        // Variance for realistic noise
        variance: this.config.variance,
      }

      this.sensors.push(sensor)
    }
  }

  /**
   * Generate a single distance data packet for a sensor
   * Format: [0x04, 0x00, sensorId, distanceLow, distanceHigh]
   */
  private generateDistancePacket(sensor: MockSensor): Buffer {
    const dataIndicator = 0x04
    const distanceIndicator = 0x00

    // Add variance to the distance reading
    const variance =
      (Math.random() - 0.5) * 2 * sensor.variance * sensor.baseDistance
    let distance = Math.max(
      this.config.minDistance,
      Math.min(
        this.config.maxDistance,
        sensor.baseDistance + variance
      )
    )

    // Round to nearest cm
    distance = Math.round(distance)

    // Create buffer: [dataIndicator, distanceIndicator, sensorId, distanceLow, distanceHigh]
    const packet = Buffer.alloc(5)
    packet.writeUInt8(dataIndicator, 0)
    packet.writeUInt8(distanceIndicator, 1)
    packet.writeUInt8(sensor.id, 2)
    packet.writeUInt16LE(distance, 3)

    return packet
  }

  /**
   * Start the simulation - sends pings from all sensors in rotation
   */
  public startSimulation(): void {
    if (this.isRunning) {
      console.warn('Simulation is already running')
      return
    }

    this.isRunning = true

    this.simulationInterval = setInterval(() => {
      const sensor = this.sensors[this.currentPingIndex]
      if (sensor && this.readParser) {
        const packet = this.generateDistancePacket(sensor)
        // Emit the packet as if it came from the device
        this.readParser.emit('data', packet)
      }
      this.currentPingIndex = (this.currentPingIndex + 1) % this.config.sensorCount
    }, this.config.simulationInterval)
  }

  /**
   * Stop the simulation
   */
  public stopSimulation(): void {
    if (!this.isRunning) {
      console.warn('Simulation is not running')
      return
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval)
      this.simulationInterval = null
    }

    this.isRunning = false
    console.log('Ultrasonic sensors simulation stopped')
  }

  /**
   * Check if simulation is running
   */
  public isSimulationRunning(): boolean {
    return this.isRunning
  }

  /**
   * Get all sensors configuration
   */
  public getSensors(): MockSensor[] {
    return [...this.sensors]
  }

  /**
   * Get a specific sensor by ID
   */
  public getSensor(id: number): MockSensor | undefined {
    return this.sensors.find((s) => s.id === id)
  }

  /**
   * Update a sensor's base distance (simulates moving an object)
   */
  public updateSensorDistance(id: number, distance: number): void {
    const sensor = this.sensors.find((s) => s.id === id)
    if (sensor) {
      sensor.baseDistance = Math.max(
        this.config.minDistance,
        Math.min(this.config.maxDistance, distance)
      )
    }
  }

  /**
   * Update a sensor's position
   */
  public updateSensorPosition(
    id: number,
    xFeet: number,
    yFeet: number,
    zFeet: number
  ): void {
    const sensor = this.sensors.find((s) => s.id === id)
    if (sensor) {
      sensor.xFeet = xFeet
      sensor.yFeet = yFeet
      sensor.zFeet = zFeet
    }
  }

  /**
   * Update a sensor's orientation
   */
  public updateSensorOrientation(
    id: number,
    horizontalAngle: number,
    verticalAngle: number
  ): void {
    const sensor = this.sensors.find((s) => s.id === id)
    if (sensor) {
      sensor.horizontalAngle = horizontalAngle
      sensor.verticalAngle = verticalAngle
    }
  }

  /**
   * Update the configuration
   */
  public updateConfig(
    config: Partial<UltrasonicSensorsMockConfig>
  ): void {
    this.config = { ...this.config, ...config }

    // If sensor count changed, reinitialize sensors
    if (config.sensorCount !== undefined) {
      this.initializeSensors()
    }
  }

  /**
   * Get the current configuration
   */
  public getConfig(): UltrasonicSensorsMockConfig {
    return { ...this.config }
  }

  /**
   * Generate a single packet for manual testing
   */
  public generateTestPacket(sensorId: number, distance: number): Buffer {
    const dataIndicator = 0x04
    const distanceIndicator = 0x00

    const packet = Buffer.alloc(5)
    packet.writeUInt8(dataIndicator, 0)
    packet.writeUInt8(distanceIndicator, 1)
    packet.writeUInt8(sensorId, 2)
    packet.writeUInt16LE(Math.round(distance), 3)

    return packet
  }

  /**
   * Reset all sensors to their initial state with new random positions
   */
  public resetSensors(): void {
    this.currentPingIndex = 0
    this.initializeSensors()
  }
}

export default UltrasonicSensorsMock
