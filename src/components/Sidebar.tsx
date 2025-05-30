import { Component, createEffect, onMount } from 'solid-js'
import { SetStoreFunction } from 'solid-js/store'
import { SidebarData } from '../contexts/SidebarContext'

// the sidebar is a block that appears on the right. it is intended that
// other components in the program can use a Portal to display content on the
// sidebar. when there is no content on the sidebar, it is not visible
export const Sidebar: Component<{
  setSidebarContext: SetStoreFunction<SidebarData>
}> = (props) => {
  // reference to the mounting point for Portal
  let contentMount: undefined | HTMLDivElement

  // default cleanup function (initially nothing to cleanup)
  let contentCleanup: () => unknown = () => {}

  // once the div is mounted, use it to fill the properties of the
  // sidebar context
  onMount(() => {
    if (contentMount === undefined)
      throw new Error('Could not find sidebar mount')

    // give access to the mount
    createEffect(() => props.setSidebarContext('mount', contentMount))

    // create the function that cleans up the sidebar
    props.setSidebarContext(
      'clearSidebar',
      (_: unknown) => (cleanup?: () => unknown) => {
        contentCleanup() // let the source of the sidebar content cleanup
        contentMount.replaceChildren() // remove any leftover children
        contentCleanup = cleanup ?? (() => {}) // store the new cleanup function
      }
    )
  })

  return (
    <>
      <div
        ref={contentMount}
        class="flex-none w-min h-full overflow-y-auto bg-base-200 rounded-l-md *:m-4"
      />
    </>
  )
}
