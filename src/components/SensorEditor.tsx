import { Component, For } from 'solid-js'
import { CageContext } from '../contexts/CageContext'
import { useContextOrThrow } from '../util/useContextOrThrow'
import { sensorTypeLabels } from '../types/SensorData'

export const SensorEditor: Component<{}> = () => {
  const cage = useContextOrThrow(CageContext)

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
            <select>
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
            />
            <span class="label">deg</span>
          </label>
          <p class="validator-hint mt-1">Must be between -180 and 180</p>
        </div>
      </div>
    </>
  )
}
