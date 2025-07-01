import { Component } from 'solid-js'

// confirmation menu for confirming user intends to quit before doing so
export const QuitConfirmation: Component<{
  // modal is activated with ref.showModal()
  ref: HTMLDialogElement | undefined
}> = (props) => {
  return (
    <>
      <dialog
        ref={props.ref}
        class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg text-center">
            Are you sure that you want to exit to desktop?
          </h3>
          <div class="modal-action justify-center">
            <form method="dialog">
              <button
                onClick={() => window.electronAPI.closeApp()}
                class="btn mr-2 btn-outline">
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
