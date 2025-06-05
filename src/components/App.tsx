import { Component, createEffect, createSignal, JSX, on } from 'solid-js'
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
import { ClearSensorsButton } from './ClearSensorsButton'
import { CoordinatorConnectionButton } from './CoordinatorConnectionButton'

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

  async function loadCage() {
    const loadedCage = await window.electronAPI.loadCageConfiguration()
    setCage((prev) => loadedCage ?? prev)
  }
  loadCage()

  let closeAppConfirmRef: undefined | HTMLDialogElement
  document.addEventListener('keyup', (event) => {
    closeAppConfirmRef?.showModal()
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

  // the content of the sidebar
  const [sidebar, setSidebar] = createSignal<JSX.Element>(<></>)

  let cleanupSidebar: () => unknown = () => {}
  function setSidebarContent(
    newElement?: JSX.Element,
    cleanup?: () => unknown
  ) {
    cleanupSidebar()
    setSidebar(newElement ?? <></>)
    cleanupSidebar = cleanup ?? (() => {})
  }

  // for testing only
  const [pingHandler, setPingHandler] = createSignal<
    undefined | ((centimeters: number) => void)
  >()
  const [sensors, setSensors] = createStore<SensorData[]>([])

  return (
    <>
      <CageContext.Provider value={cage}>
        <SidebarContext.Provider value={{ setSidebar: setSidebarContent }}>
          <SensorsContext.Provider
            value={{
              sensors,
              setSensors,
            }}
          >
            <div class="w-screen h-screen flex bg-base-100">
              {/* unhandled clicks in this dev will close the sidebar */}
              <div
                class="size-full"
                onClick={() => setSidebarContent()}
              >
                <div class="flex flex-col size-full">
                  <div class="flex mx-[35px] mt-4 p-2 rounded-md bg-base-200 space-x-2">
                    <CreateSensorButton />
                    <ClearSensorsButton />
                    <CageSettingsButton setCage={setCage} />
                    <CoordinatorConnectionButton />
                  </div>
                  <Grid />
                </div>
              </div>
              <Sidebar>
                <>{sidebar()}</>
              </Sidebar>
            </div>
          </SensorsContext.Provider>
        </SidebarContext.Provider>
      </CageContext.Provider>

      <dialog
        ref={closeAppConfirmRef}
        class="modal"
      >
        <div class="modal-box">
          <h3 class="font-bold text-lg text-center">
            Are you sure that you want to exit to desktop?
          </h3>
          <div class="modal-action justify-center">
            <form method="dialog">
              <button
                onClick={() => window.electronAPI.closeApp()}
                class="btn mr-2 btn-outline"
              >
                Yes
              </button>
              <button class="btn btn-outline">No</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}
