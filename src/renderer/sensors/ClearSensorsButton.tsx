import { VsTrash } from 'solid-icons/vs'
import { Component } from 'solid-js'
import { SensorsContext } from '../contexts/SensorsContext'
import { useContextOrThrow } from '../../util/useContextOrThrow'

// button that clears all sensors
export const ClearSensorsButton: Component = () => {
  const sensors = useContextOrThrow(SensorsContext)

  // use a confirmation modal to prevent unwanted deletions
  let deleteConfirmRef: undefined | HTMLDialogElement

  return (
    <>
      {/* clear button (opens modal) */}
      <div
        class="tooltip tooltip-bottom tooltip-error"
        data-tip="Clear Sensors"
      >
        <button
          onClick={() => deleteConfirmRef?.showModal()}
          class="btn btn-outline btn-square btn-primary btn-sm"
          disabled={sensors.sensors.length === 0}
        >
          <VsTrash size="20" />
        </button>
      </div>

      {/* delete confirmation */}
      <dialog
        ref={deleteConfirmRef}
        class="modal"
      >
        <div class="modal-box">
          <h3 class="font-bold text-lg text-center">
            Are you sure that you want to delete all sensors?
          </h3>
          <div class="modal-action justify-center">
            <form method="dialog">
              <button
                onClick={() => sensors.setSensors([])}
                class="btn mr-2 btn-error btn-outline"
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
