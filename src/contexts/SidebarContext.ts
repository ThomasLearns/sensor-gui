import { Component, createContext, Setter } from 'solid-js'

export type SidebarData = {
  setSidebar: Setter<Component>
}

export const SidebarContext = createContext<SidebarData>()
