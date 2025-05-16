import { Component } from 'solid-js'
import { Grid } from './Grid'

// this is the top level component of the renderer. It is inserted into the root element
// (a div inside <body>)
export const App: Component<Record<string, never>> = () => {
  return (
    <>
      <div class="w-screen h-screen">
        <Grid
          size={{ x: 30, y: 15 }}
          sectorLabels={[
            ['C', 'F', 'I'],
            ['B', 'E', 'H'],
            ['A', 'D', 'G'],
          ]}
        />
      </div>
    </>
  )
}
