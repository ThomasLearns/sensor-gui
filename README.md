# Sensor GUI

The role of the sensor GUI is to display pings from red team's sensor network to red team's sensor operator.

The sensor GUI receives its ping data from the coordinator Arduino UNO over serial.

## User Guide

### Cage

You can edit the dimensions of the simulated cage with the **Cage Settings** menu. To enter the menu, click on the gear button on the toolbar.

In the **Cage Settings** menu, you can edit the dimensions of the cage, how many sectors there are, and the labels used for the sectors.

You can also save your configuration. To do so, click the **Save Cage Configuration** button. This will overwrite the previous saved configuration with your current settings. This cage configuration will be used upon starting the application and upon clicking the **Load Cage Configuration** button.

You can close the **Cage Settings** menu by clicking on the gear button again or clicking outside the sidebar.

### Coordinator

You can see and change the connected coordinators with the coordinator button. This button will be green when there is at least one coordinator connected, and red when no coordinator is connected.

You can click on the coordinator button, which has the USB symbol, to open the connection menu. Here you can see the paths and connection status of identified Arduino UNOs. You can click the **Connect** button of a disconnected Arduino UNO to attempt connection. You can click the **Disconnect** button of a connected Arduino UNO to disconnect.

When a coordinator is first plugged in, the sensor GUI will attempt to connect to it automatically.

### Sensors

You can add sensors with the **Add Sensor** button.

You can move sensors anywhere on the cage through dragging.

When a sensor is created and when a sensor is clicked, it will open a sensor configuration menu. You can close this menu by clicking the associated sensor or clicking outside the sidebar.

#### Sensor Configuration Menu

You can set the ROUT number of a sensor with the **ROUT #** field. The current ROUT number can also be seen on the sensor graphic. It is important that this number matches the label on the back of the physical sensor, as this number is used to identify which sensor a ping came from.

You can set the sensor type of a sensor with the **Sensor Type** field. At the moment, the only type is _Ultrasonic_.

You can change the sensor's position with the **X** and **Y** fields. You can use the keyboard or the arrow buttons to change these fields. You cannot input values that would place the sensor outside the cage

You can change the orientation of the sensor with the **Horizontal Angle** and **Vertical Angle** fields. You can use the keyboard or the arrow buttons to change these fields.

The **Horizontal Angle** field is the angle of the sensor horizontally, with 0 degrees being pointing straight right, the positive direction being counter-clockwise, and the negative direction being clockwise.

The **Vertical Angle** field is the angle of the sensor vertically, with 0 degrees being level, the positive direction correlating with pointing up, and the negative direction correlating with pointing down.

### Pings

When a ping is received by the coordinator, it will send the ping over serial to the sensor GUI. The sensor GUI will parse the ping and display the ping accordingly.

## Developer Guide

### Sensors

#### Ultrasonic Sensor

Ultrasonic sensors have a conical beam. They will render [distance packets](#distance-packets)

The sensor type id for ultrasonic sensors is `1`.

### Packets

#### Distance Packets

Distance packets will be rendered at ALL sensors where the ROUT number matches the ping's sensorId.

If the sensor is configured with a vertical rotation, and the ping is calculated to have been > 0.1 ft above or below the sensor's horizontal plane, a height helper number will appear below the sensor graphic indicating the height above or below the sensor's horizontal plane of the last ping received for that sensor.

Distance packets are supported in the following format:

Data Packet Indicator | Data Packet Indicator | Sensor Id | Distance (cm)
---|---|---|---
`0x04` | `0x00` | `int8` | `int16`

Example: `0x04000C003A`

#### Jam Packets

Jam packets will be cause pings to be repeatedly registered at all sensors matching the packet's data for the next 0.5 seconds.

Jam packets are supported in the following format:

Data Packet Indicator | Jam Packet Indicator | Jammer Id | Target Sensor Type | Target Sensor Id
---|---|---|---|---
`0x04` | `0x01` | `int8` | `int8` | `int8`

Example: `0x0401010000`

The jammer id is unused by the sensor GUI.

The sensor type indicates the id of a type of sensor. If it is `0`, it matches all sensor types

The sensor id indicates the ROUT number of a sensor. If it is `0`, it matches all sensors.

Only sensors that match the sensor type and the sensor id will be jammed.

### Project Structure

The sensor GUI is an **electronjs** application.

It utilizes **solidjs** as its reactive framework.

It uses **tailwindcss** for css classes and **daisyui** for ui primitives and the color scheme.

**Vite** is used as the build tool and **electron-forge** is used to build the sensor GUI into a distributable.

**Threejs** is used for 3D rendering.

### Development

#### Run
To run the application in dev mode, use `npm run start`.

#### Build
To build the application into `out/` run `npm run make`.

#### Release
To generate a release from the last commit, do the following:
```shell
git tag <version>
git push origin <version>
```

For example:
```shell
git tag v4.0.0
git push origin v4.0.0
```

This should start a runner on Spork that will build the project and create a release (may take 5-10 minutes).
