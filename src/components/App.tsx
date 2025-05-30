import { Component, createEffect, createSignal, on } from 'solid-js'
import { Grid } from './Grid'
import { CageContext, CageData } from '../contexts/CageContext'
import { createStore } from 'solid-js/store'
import { Sidebar } from './Sidebar'
import { SidebarContext, SidebarData } from '../contexts/SidebarContext'
import { SensorData } from '../types/SensorData'
import { CreateSensorButton } from './CreateSensorButton'
import { SensorsContext } from '../contexts/SensorsContext'
import { UltrasonicRenderer } from './UltrasonicRenderer'
import { CageSettingsButton } from './CageSettingsButton'

// this is the top level component of the renderer. It is inserted into the root element
// (a div inside <body>)
export const App: Component<Record<string, never>> = () => {
  // the grid requires being provided cage context information.
  // in the future, this may not be a static value, but set in a
  // configuration menu
  const [cage, setCage] = createStore<CageData>({
    length: 30,
    width: 15,
    labels: [
      ['C', 'F', 'I'],
      ['B', 'E', 'H'],
      ['A', 'D', 'G'],
    ],
    rowCount: 0,
    columnCount: 0,
  })
  // keep derived context data up to date
  createEffect(() => setCage('rowCount', cage.labels.length))
  createEffect(() =>
    setCage(
      'columnCount',
      cage.labels.reduce(
        (mostColumns, currentRow) =>
          mostColumns > currentRow.length ? mostColumns : currentRow.length,
        0
      )
    )
  )

  const [sidebar, setSidebar] = createStore<SidebarData>({
    clearSidebar: undefined,
    mount: undefined,
  })

  // for testing only
  const [pingHandler, setPingHandler] = createSignal<
    undefined | ((centimeters: number) => void)
  >()
  const [sensors, setSensors] = createStore<SensorData[]>([
    {
      xFeet: 5,
      yFeet: 13,
      horizontalAngle: 0,
      verticalAngle: 0,
      routNumber: 12,
      type: 'ultrasonic',
      renderer: UltrasonicRenderer,
      measuringAngle: 15,
      maxRange: 4,
      getPingHandler: pingHandler,
      setPingHandler,
    },
  ])

  return (
    <>
      <div class="w-screen h-screen flex bg-base-100">
        {/* unhandled clicks in this dev will close the sidebar */}
        <div
          class="size-full"
          onClick={() => sidebar.clearSidebar?.()}
        >
          <SidebarContext.Provider value={sidebar}>
            <SensorsContext.Provider
              value={{
                sensors,
                setSensors,
              }}
            >
              <div class="flex flex-col size-full">
                <CageContext.Provider value={cage}>
                  <div class="flex mx-[35px] mt-4 p-2 rounded-md bg-base-200 space-x-2">
                    <CreateSensorButton />
                    <CageSettingsButton setCage={setCage} />
                  </div>
                  <Grid />
                </CageContext.Provider>
              </div>
            </SensorsContext.Provider>
          </SidebarContext.Provider>
        </div>
        <Sidebar setSidebarContext={setSidebar} />
      </div>
    </>
  )
}
