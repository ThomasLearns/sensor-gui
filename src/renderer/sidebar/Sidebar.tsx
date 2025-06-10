import { Component, JSX } from 'solid-js'

// the sidebar is a block that appears on the right. it is intended that
// other components in the program can use a Portal to display content on the
// sidebar. when there is no content on the sidebar, it is not visible
export const Sidebar: Component<{
  children?: JSX.Element
}> = (props) => {
  return (
    <>
      <div class="flex-none w-min h-full overflow-y-auto bg-base-200 rounded-l-md *:m-4">
        {props.children}
      </div>
    </>
  )
}
