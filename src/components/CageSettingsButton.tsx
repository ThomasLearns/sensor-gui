import { VsSettingsGear } from 'solid-icons/vs'
import { Component, createSignal, Show } from 'solid-js'
import { SidebarContext } from '../contexts/SidebarContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { CageSettingsEditor } from './CageSettingsEditor'
import { Portal } from 'solid-js/web'
import { SetStoreFunction } from 'solid-js/store'
import { CageData } from '../contexts/CageContext'

// button toggling cage settings editor
export const CageSettingsButton: Component<{
  setCage: SetStoreFunction<CageData>
}> = (props) => {
  // get contextual information
  const sidebar = useContextOrThrow(SidebarContext)

  // whether the sidebar is set to show cage settings
  const [showSettings, setShowSettings] = createSignal(false)

  // open or close the cage settings sidebar
  function toggleCageSettingsMenu(event: MouseEvent) {
    if (showSettings()) {
      // close the sidebar
      sidebar.setSidebar(() => () => <></>)
    } else {
      // open the sidebar
      sidebar.setSidebar(() => () => (
        <CageSettingsEditor setCage={props.setCage} />
      ))
    }
    event.stopPropagation()
  }

  return (
    <>
      <div
        class="tooltip tooltip-bottom tooltip-neutral"
        data-tip="Cage Settings"
      >
        <button
          onClick={toggleCageSettingsMenu}
          class="btn btn-outline btn-square btn-primary btn-sm"
        >
          <VsSettingsGear size="20" />
        </button>
      </div>
    </>
  )
}
