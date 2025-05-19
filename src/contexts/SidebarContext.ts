import { createContext } from 'solid-js'

export type SidebarData = {
  // ref to the mounting point of sidebar content.
  // use Portal to place html here
  mount: HTMLDivElement | undefined
  // function to clear existing content on the sidebar.
  // pass in your own cleanup function for the next content to be added.
  // always call this before Showing a Portal mounted to the sidebar
  clearSidebar: undefined | ((cleanup?: () => unknown) => void)
}

export const SidebarContext = createContext<SidebarData>()
