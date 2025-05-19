import { Component, createEffect } from 'solid-js'
import { Grid } from './Grid'
import { CageContext, CageData } from '../contexts/CageContext'
import { createStore } from 'solid-js/store'

// this is the top level component of the renderer. It is inserted into the root element
// (a div inside <body>)
export const App: Component<Record<string, never>> = () => {
  // the grid requires being provided cage context information.
  // in the future, this may not be a static value, but set in a
  // configuration menu
  const [cage, setCage] = createStore<CageData>({
    width: 30,
    height: 15,
    labels: [
      ['C', 'F', 'I'],
      ['B', 'E', 'H'],
      ['A', 'D', 'G'],
    ],
    rowCount: 0,
    columnCount: 0,
  })
  // keep derived context data up to date
  createEffect(() => setCage('rowCount', cage.labels.length))
  createEffect(() =>
    setCage(
      'columnCount',
      cage.labels.reduce(
        (mostColumns, currentRow) =>
          mostColumns > currentRow.length ? mostColumns : currentRow.length,
        0
      )
    )
  )
  return (
    <>
      <div class="w-screen h-screen">
        <CageContext.Provider value={cage}>
          <Grid />
        </CageContext.Provider>
      </div>
    </>
  )
}
