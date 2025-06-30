import { BiRegularErrorCircle } from 'solid-icons/bi'
import { FaBrandsUsb } from 'solid-icons/fa'
import { VsDebugDisconnect } from 'solid-icons/vs'
import { Component, createSignal, For, mapArray, Show } from 'solid-js'

// allow configuration of coordinator connections
export const CoordinatorConnectionMenu: Component<{
  devices: {
    path: string
    connected: boolean
  }[]
}> = (props) => {
  // used to determine if a connection is in a loading state
  const operationsInProgress = mapArray(
    () => props.devices,
    () => {
      return createSignal(false)
    }
  )

  // tracks latest error message for each connection
  const getConnectionErrors = mapArray(
    () => props.devices,
    () => {
      const [get, set] = createSignal('')
      return { get, set }
    }
  )

  // connect or disconnect to a port
  async function toggleConnection(index: number) {
    // clear error and start loading spinner
    operationsInProgress()[index][1](true)
    getConnectionErrors()[index].set('')

    // request connection or disconnection from main process
    const result = await window.electronAPI.trySetConnection(
      props.devices[index].path,
      !props.devices[index].connected
    )
    // set the error if operation failed (result isn't true)
    getConnectionErrors()[index].set(result === true ? '' : result)

    // stop loading spinner
    operationsInProgress()[index][1](false)
  }

  return (
    <>
      <div class="flex h-min flex-col select-none w-[15rem]">
        <ul class="list">
          <For each={props.devices}>
            {(device, getIndex) => (
              <>
                <li class="list-row bg-base-300 rounded-md">
                  <div
                    class="tooltip tooltip-right"
                    classList={{
                      'tooltip-error': !device.connected,
                      'tooltip-success': device.connected,
                    }}
                    data-tip={device.connected ? 'Connected' : 'Not Connected'}
                  >
                    <FaBrandsUsb
                      size="20"
                      classList={{
                        'fill-success': device.connected,
                        'fill-error': !device.connected,
                      }}
                    />
                  </div>
                  {device.path}
                  <div
                    class="tooltip-bottom"
                    classList={{
                      'tooltip-success': !device.connected,
                      'tooltip-error': device.connected,
                      'tooltip': !operationsInProgress()[getIndex()][0](),
                    }}
                    data-tip={device.connected ? 'Disconnect' : 'Connect'}
                  >
                    <button
                      class="btn btn-square btn-outline btn-xs"
                      onClick={() => toggleConnection(getIndex())}
                      disabled={operationsInProgress()[getIndex()][0]()}
                    >
                      <Show
                        when={!operationsInProgress()[getIndex()][0]()}
                        fallback={
                          <>
                            <span class="loading loading-spinner loading-sm" />
                          </>
                        }
                      >
                        <VsDebugDisconnect size="15" />
                      </Show>
                    </button>
                  </div>
                </li>
                {/* show error message if it is set */}
                <Show when={getConnectionErrors()[getIndex()].get() !== ''}>
                  <div class="flex my-2 mb-3 text-error">
                    <BiRegularErrorCircle
                      class="mx-2"
                      size="20"
                    />
                    {getConnectionErrors()[getIndex()].get()}
                  </div>
                </Show>
              </>
            )}
          </For>
        </ul>
      </div>
    </>
  )
}
