import { Component, createSignal, Show } from 'solid-js'

// an invisible element on top (when enabled) that catches drag related
// events and sends them to the correct targets
export const DragShield: Component<{
  setEnable: (callback: () => unknown) => unknown
  onDragEnd?: (event: MouseEvent) => unknown
  onDrag?: (event: MouseEvent) => unknown
}> = (props) => {
  // whether the drag shield is activated
  const [getEnabled, setEnabled] = createSignal(false)

  // allow parent to enable drag shield
  props.setEnable(() => setEnabled(true))

  return (
    <>
      {/* remain hidden except when dragging */}
      <Show when={getEnabled()}>
        {/* cover the entire screen and send drag-related events to handlers */}
        <div
          class="fixed top-0 bottom-0 left-0 right-0"
          onMouseUp={(event) => {
            props.onDragEnd?.(event)
            setEnabled(false)
          }}
          onMouseMove={props.onDrag}
          onMouseLeave={(event) => {
            props.onDragEnd?.(event)
            setEnabled(false)
          }}
        />
      </Show>
    </>
  )
}
