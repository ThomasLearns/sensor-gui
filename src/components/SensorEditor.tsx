import { Component, createSignal, For } from 'solid-js'
import { CageContext } from '../contexts/CageContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { SensorData, sensorTypeLabels } from '../types/SensorData'
import { SetStoreFunction } from 'solid-js/store'
import { SensorContext } from '../contexts/SensorContext'
import { getValidNumberInput } from '../util/getValidNumberInput'
import { VsTrash } from 'solid-icons/vs'
import { SensorsContext } from '../contexts/SensorsContext'

export const SensorEditor: Component<{
  setSensor: SetStoreFunction<SensorData>
}> = (props) => {
  const cage = useContextOrThrow(CageContext)
  const sensor = useContextOrThrow(SensorContext)
  const sensors = useContextOrThrow(SensorsContext)

  let deleteConfirmRef: undefined | HTMLDialogElement

  return (
    <>
      <div
        class="flex h-full flex-col select-auto w-[15rem]"
        onClick={(event) => event.stopPropagation()}
      >
        {/* rout number */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label">ROUT #:</span>
            <input
              type="number"
              class="text-right"
              placeholder="1"
              min="1"
              max="99"
              onInput={(event) =>
                props.setSensor(
                  'routNumber',
                  (prev) => getValidNumberInput(event.currentTarget, 1) ?? prev
                )
              }
              value={sensor.routNumber}
            />
          </label>
          <p class="validator-hint mt-0">
            Must be a whole number between 1 and 99
          </p>
        </div>

        {/* type */}
        <div>
          <label class="select select-xs border w-full validator">
            <span class="label">Sensor Type:</span>
            <select
              onInput={(event) => {
                if (!(event.currentTarget.value in sensorTypeLabels))
                  throw new Error(
                    `recieved "${event.currentTarget.value}" as a sensor type`
                  )
                props.setSensor(
                  'type',
                  event.currentTarget.value as keyof typeof sensorTypeLabels
                )
              }}
              value={sensor.type}
            >
              <For each={Object.entries(sensorTypeLabels)}>
                {([internalTypeName, displayTypeName]) => (
                  <option value={internalTypeName}>{displayTypeName}</option>
                )}
              </For>
            </select>
          </label>
          <p class="validator-hint mt-0">Must be between 0 and {cage.width}</p>
        </div>

        {/* X position */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label">X:</span>
            <input
              type="number"
              step="any"
              class="text-right"
              placeholder="0"
              min="0"
              max={cage.width}
              onInput={(event) =>
                props.setSensor(
                  'xFeet',
                  (prev) => getValidNumberInput(event.currentTarget, 0) ?? prev
                )
              }
              value={sensor.xFeet}
            />
            <span class="label">feet</span>
          </label>
          <p class="validator-hint mt-0">Must be between 0 and {cage.width}</p>
        </div>

        {/* Y position */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label">Y:</span>
            <input
              type="number"
              step="any"
              class="text-right"
              min="0"
              placeholder="0"
              max={cage.height}
              onInput={(event) =>
                props.setSensor(
                  'yFeet',
                  (prev) => getValidNumberInput(event.currentTarget, 0) ?? prev
                )
              }
              value={sensor.yFeet}
            />
            <span class="label">feet</span>
          </label>
          <p class="validator-hint mt-0">Must be between 0 and {cage.width}</p>
        </div>

        {/* horizontal angle */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label">Horizontal Angle:</span>
            <input
              type="number"
              step="any"
              class="text-right"
              min="0"
              placeholder="0"
              max="360"
              onInput={(event) =>
                props.setSensor(
                  'horizontalAngle',
                  (prev) => getValidNumberInput(event.currentTarget, 0) ?? prev
                )
              }
              value={sensor.horizontalAngle}
            />
            <span class="label">deg</span>
          </label>
          <p class="validator-hint mt-1">Must be between 0 and 360</p>
        </div>

        {/* vertical angle */}
        <div>
          <label class="input input-xs border w-full validator">
            <span class="label">Vertical Angle:</span>
            <input
              type="number"
              step="any"
              class="text-right"
              min="-180"
              placeholder="0"
              max="180"
              onInput={(event) =>
                props.setSensor(
                  'verticalAngle',
                  (prev) => getValidNumberInput(event.currentTarget, 0) ?? prev
                )
              }
              value={sensor.verticalAngle}
            />
            <span class="label">deg</span>
          </label>
          <p class="validator-hint mt-1">Must be between -180 and 180</p>
        </div>

        {/* delete button */}
        <div
          class="tooltip tooltip-error size-min tooltip-right"
          data-tip="Delete Sensor"
        >
          <button
            class="btn btn-sm btn-secondary btn-square btn-outline"
            onClick={() => deleteConfirmRef?.showModal()}
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
            <h3 class="font-bold text-lg">
              Are you sure that you want to delete sensor #{sensor.routNumber}?
            </h3>
            <p class="py-4"></p>
            <div class="modal-action">
              <form method="dialog">
                <button
                  onClick={() => {
                    sensors.setSensors((prev) =>
                      prev.toSpliced(sensor.index(), 1)
                    )
                    console.log('deleting?')
                  }}
                  class="btn"
                >
                  Yes
                </button>
                <button class="btn">No</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </>
  )
}
