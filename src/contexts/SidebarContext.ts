import { Component, createContext, Setter } from 'solid-js'

export type SidebarData = {
  setSidebar: (newComponent?: Component, cleanup?: () => unknown) => unknown
}

export const SidebarContext = createContext<SidebarData>()
