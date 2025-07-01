import { createContext } from 'solid-js'

// gives interface for tracking drag events anywhere within the app window
export const DragContext = createContext<{
  startDrag: (
    onDrag: (event: MouseEvent) => unknown,
    onDragStop: (event: MouseEvent) => unknown
  ) => unknown
}>()
