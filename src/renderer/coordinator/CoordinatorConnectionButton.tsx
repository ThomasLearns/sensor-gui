import { FaBrandsUsb } from 'solid-icons/fa'
import {
  Component,
  createMemo,
  createSignal,
  getOwner,
  runWithOwner,
} from 'solid-js'
import { createStore, reconcile, unwrap } from 'solid-js/store'
import { SidebarContext } from '../contexts/SidebarContext.js'
import { useContextOrThrow } from '../../util/useContextOrThrow.js'
import { CoordinatorConnectionMenu } from './CoordinatorConnectionMenu.js'

// open menu for managing coordinator connections
export const CoordinatorConnectionButton: Component = () => {
  const [devicesInfo, setDevicesInfo] = createStore<{
    devices: { path: string; connected: boolean }[]
  }>({ devices: [] })
  // get contextual information
  const sidebar = useContextOrThrow(SidebarContext)

  // controls sidebar state
  const [showMenu, setShowMenu] = createSignal(false)

  // use this component as owner of sidebar menu content
  const owner = getOwner()

  window.electronAPI.onUpdateDevices((newDeviceStatuses) => {
    setDevicesInfo(
      'devices',
      reconcile(
        Object.entries(newDeviceStatuses).map(([path, connected]) => ({
          path,
          connected,
        }))
      )
    )
  })

  const getConnections = createMemo(() =>
    devicesInfo.devices.filter((device) => device.connected === true)
  )

  function toggleMenu(event: MouseEvent) {
    if (showMenu()) {
      // close sidebar
      setShowMenu(false)
      sidebar.setSidebar(<></>)
    } else {
      // open sidebar
      setShowMenu(true)
      runWithOwner(owner, () => {
        sidebar.setSidebar(
          <CoordinatorConnectionMenu devices={devicesInfo.devices} />,
          () => setShowMenu(false)
        )
      })
    }

    event.stopPropagation()
  }

  return (
    <>
      <div
        class="tooltip tooltip-bottom"
        classList={{
          'tooltip-error': getConnections().length === 0,
          'tooltip-success': getConnections().length > 0,
        }}
        data-tip={
          getConnections().length === 1
            ? `Connected on ${getConnections()[0].path}`
            : getConnections().length > 1
            ? `${getConnections().length} Connections`
            : `Not Connected`
        }
      >
        <button
          onClick={toggleMenu}
          class="btn btn-outline btn-square btn-sm"
          classList={{
            'btn-error': getConnections().length === 0,
            'btn-success': getConnections().length > 0,
          }}
        >
          <FaBrandsUsb size="20" />
        </button>
      </div>
    </>
  )
}
