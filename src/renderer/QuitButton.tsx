import { ImExit } from 'solid-icons/im'
import { Component } from 'solid-js'

// button to quit application
export const QuitButton: Component<{
  // parent provides functionality to actually quit
  onClick: () => unknown
}> = (props) => {
  return (
    <>
      <div class="flex flex-row-reverse flex-1 space-x-2">
        <div
          class="tooltip tooltip-bottom tooltip-error"
          data-tip="Exit Program">
          <button
            onClick={props.onClick}
            class="btn btn-outline btn-square btn-error btn-sm">
            <ImExit size="20" />
          </button>
        </div>
      </div>
    </>
  )
}
