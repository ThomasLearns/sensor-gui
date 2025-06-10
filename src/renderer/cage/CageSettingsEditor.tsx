import { batch, Component, createSignal, Show } from 'solid-js'
import { SetStoreFunction, unwrap } from 'solid-js/store'
import { CageContext, CageData } from '../contexts/CageContext'
import { useContextOrThrow } from '../../util/useContextOrThrow'
import { getValidNumberInput } from '../../util/getValidNumberInput'
import { VsEdit, VsSave } from 'solid-icons/vs'
import { IoDownload } from 'solid-icons/io'
import { LabelEditor } from './LabelEditor'

// settings sidebar menu for cage related parameters
export const CageSettingsEditor: Component<{
  setCage: SetStoreFunction<CageData>
}> = (props) => {
  // get contextual data
  const cage = useContextOrThrow(CageContext)

  const [getSaving, setSaving] = createSignal(false)
  const [getSaveError, setSaveError] = createSignal(false)
  const [getLoading, setLoading] = createSignal(false)
  const [getLoadError, setLoadError] = createSignal(false)

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
        <button
          class="btn btn-sm btn-primary btn-outline self-center whitespace-nowrap text-nowrap"
          onClick={() => labelEditorRef?.showModal()}
        >
          <span class="m-2">Edit Labels</span>
        </button>

        {/* label editor */}
        <LabelEditor
          ref={labelEditorRef}
          setLabels={(newLabels) => props.setCage('labels', newLabels)}
        />

        <div class="flex space-x-2 mt-4">
          {/* save cage */}
          <div
            class="tooltip tooltip-right overflow-visible"
            classList={{
              'tooltip-error': getSaveError(),
            }}
            data-tip={getSaveError() ? 'Save Error' : 'Save Cage Configuration'}
          >
            <button
              class="btn btn-outline btn-square"
              classList={{
                'btn-error': getSaveError(),
                'btn-secondary': !getSaveError(),
              }}
              disabled={getLoading() || getSaving()}
              onClick={async () => {
                setSaving(true)
                setSaveError(
                  !(await window.electronAPI.saveCageConfiguration(
                    structuredClone(unwrap(cage))
                  ))
                )
                setSaving(false)
              }}
            >
              <Show
                when={!getSaving()}
                fallback={<span class="loading loading-spinner loading-sm" />}
              >
                <VsSave size="20" />
              </Show>
            </button>
          </div>

          {/* load cage */}
          <div
            class="tooltip tooltip-bottom overflow-visible"
            data-tip={getLoadError() ? 'Load Error' : 'Load Cage Configuration'}
          >
            <button
              class="btn btn-outline btn-square"
              classList={{
                'btn-error': getLoadError(),
                'btn-secondary': !getLoadError(),
              }}
              disabled={getSaving() || getLoading()}
              onClick={async () => {
                setLoading(true)
                const loadedCage =
                  await window.electronAPI.loadCageConfiguration()
                if (loadedCage === null) {
                  setLoadError(true)
                } else {
                  setLoadError(false)
                  props.setCage(loadedCage)
                }
                setLoading(false)
              }}
            >
              <Show
                when={!getLoading()}
                fallback={<span class="loading loading-spinner loading-sm" />}
              >
                <IoDownload size="20" />
              </Show>
            </button>
          </div>
          <div class="flex-1" />
        </div>
      </div>
    </>
  )
}
