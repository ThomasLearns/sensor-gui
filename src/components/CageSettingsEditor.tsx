import { batch, Component } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import { CageContext, CageData } from '../contexts/CageContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { getValidNumberInput } from '../util/getValidNumberInput'
import { LabelEditor } from './LabelEditor'
import { VsEdit } from 'solid-icons/vs'

// settings sidebar menu for cage related parameters
export const CageSettingsEditor: Component<{
  setCage: SetStoreFunction<CageData>
}> = (props) => {
  // get contextual data
  const cage = useContextOrThrow(CageContext)

  // used to open and close label editor modal
  let labelEditorRef: undefined | HTMLDialogElement

  return (
    <>
      <div
        class="flex h-min flex-col select-auto w-[15rem]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* length */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label">Length:</span>
            <input
              type="number"
              step="any"
              class="text-right"
              placeholder="10"
              min="1"
              onInput={(event) =>
                props.setCage(
                  'length',
                  (prev) => getValidNumberInput(event.currentTarget, 10) ?? prev
                )
              }
              value={cage.length}
            />
            <span class="label">feet</span>
          </label>
          <p class="validator-hint mt-0">Must be greater than or equal to 1</p>
        </div>

        {/* width */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label">Width:</span>
            <input
              type="number"
              step="any"
              class="text-right"
              placeholder="10"
              min="1"
              onInput={(event) =>
                props.setCage(
                  'width',
                  (prev) => getValidNumberInput(event.currentTarget, 10) ?? prev
                )
              }
              value={cage.width}
            />
            <span class="label">feet</span>
          </label>
          <p class="validator-hint mt-0">Must be greater than or equal to 1</p>
        </div>

        {/* column count */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label"># Columns:</span>
            <input
              type="number"
              step="1"
              class="text-right"
              placeholder="3"
              min="1"
              max="12"
              onInput={(event) =>
                batch(() => {
                  const newColumnCount =
                    getValidNumberInput(event.currentTarget, 10) ??
                    cage.columnCount
                  props.setCage('columnCount', newColumnCount)
                  const oldColumnCount = cage.labels.reduce(
                    (max, row) => Math.max(max, row.length),
                    0
                  )
                  if (newColumnCount > oldColumnCount) {
                    props.setCage('labels', (oldLabels) =>
                      oldLabels.map((oldRow) => [
                        ...oldRow,
                        ...new Array(newColumnCount - oldRow.length).fill(''),
                      ])
                    )
                  } else if (newColumnCount < oldColumnCount) {
                    props.setCage('labels', (oldLabels) =>
                      oldLabels.map((oldRow) =>
                        oldRow.filter((_, index) => index < newColumnCount)
                      )
                    )
                  }
                })
              }
              value={cage.columnCount}
            />
          </label>
          <p class="validator-hint mt-0">Must be greater than or equal to 1</p>
        </div>

        {/* row count */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label"># Rows:</span>
            <input
              type="number"
              step="1"
              class="text-right"
              placeholder="3"
              min="1"
              max="12"
              onInput={(event) =>
                batch(() => {
                  const newRowCount =
                    getValidNumberInput(event.currentTarget, 10) ??
                    cage.rowCount
                  props.setCage('rowCount', newRowCount)
                  const oldRowCount = cage.labels.length
                  if (newRowCount > oldRowCount) {
                    props.setCage('labels', (oldLabels) => [
                      ...oldLabels,
                      ...new Array(newRowCount - oldRowCount).fill(
                        new Array(cage.columnCount).fill('')
                      ),
                    ])
                  } else if (newRowCount < oldRowCount) {
                    props.setCage('labels', (oldLabels) =>
                      oldLabels.filter((_, index) => index < newRowCount)
                    )
                  }
                })
              }
              value={cage.rowCount}
            />
          </label>
          <p class="validator-hint mt-0">Must be greater than or equal to 1</p>
        </div>

        {/* label editing button */}
        <div class="flex flex-col items-center">
          <div
            class="tooltip tooltip-neutral size-min tooltip-bottom"
            data-tip="Edit Labels"
          >
            <button
              class="btn btn-sm btn-primary btn-square btn-outline self-center"
              onClick={() => labelEditorRef?.showModal()}
            >
              <VsEdit size="20" />
            </button>
          </div>
        </div>

        {/* label editor */}
        <LabelEditor
          ref={labelEditorRef}
          setLabels={(newLabels) => props.setCage('labels', newLabels)}
        />
      </div>
    </>
  )
}
