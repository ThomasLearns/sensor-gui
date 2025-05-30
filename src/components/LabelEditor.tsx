import { Component, createEffect, For, on } from 'solid-js'
import { CageContext } from '../contexts/CageContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { createStore, unwrap } from 'solid-js/store'

// modeal for setting labels of each sector
export const LabelEditor: Component<{
  ref: undefined | HTMLDialogElement
  setLabels: (newLabels: string[][]) => unknown
}> = (props) => {
  // get contextual data
  const cage = useContextOrThrow(CageContext)

  // store mid-edit labels and keep it up to date with the real labels
  let [newLabels, setNewLabels] = createStore<string[][]>([])
  createEffect(
    on(
      () => cage.labels,
      () => setNewLabels(structuredClone(unwrap(cage.labels)))
    )
  )

  return (
    <>
      <dialog
        ref={props.ref}
        class="modal"
      >
        <div class="modal-box">
          <div
            class={`grid mb-10 max-h-[50vh] max-w-[50vw] min-w-fit mx-auto`}
            style={{
              'grid-template-columns': `repeat(${cage.columnCount}, minmax(0, 1fr))`,
            }}
          >
            <For each={newLabels.flatMap((row) => row)}>
              {(label, getIndex) => (
                <div class="border w-max">
                  <label class="input input-xs">
                    <input
                      type="text"
                      class="text-center"
                      onChange={(event) =>
                        // we use onChange because the node will be reloaded whenever we set newLabels
                        // causing the input to lose focus. onChange is when the user is done
                        setNewLabels(
                          Math.floor(getIndex() / cage.rowCount),
                          getIndex() % cage.rowCount,
                          event.currentTarget.value
                        )
                      }
                      value={label}
                    />
                  </label>
                </div>
              )}
            </For>
          </div>

          <div class="modal-action justify-center">
            <form method="dialog">
              <button
                onClick={() =>
                  props.setLabels(structuredClone(unwrap(newLabels)))
                }
                class="btn mr-2"
              >
                Save
              </button>
              <button
                class="btn"
                onClick={() =>
                  // we wait 0.5s to allow the modal to fade out before resetting
                  setTimeout(
                    () => setNewLabels(structuredClone(unwrap(cage.labels))),
                    500
                  )
                }
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}
