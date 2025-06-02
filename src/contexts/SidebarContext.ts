import { createContext, JSX } from 'solid-js'

export type SidebarData = {
  setSidebar: (newContent?: JSX.Element, cleanup?: () => unknown) => unknown
}

export const SidebarContext = createContext<SidebarData>()
