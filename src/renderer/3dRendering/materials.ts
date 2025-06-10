import { formatHex, oklch } from 'culori'
import { Color, FrontSide, MeshBasicMaterial } from 'three'

export const beamMaterial = new MeshBasicMaterial({
  color: new Color(
    formatHex(
      oklch(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-secondary')
          .trim()
      )
    )
  ),
  opacity: 0.2,
  transparent: true,
})

// material used for displaying pings
export const pingMaterial = new MeshBasicMaterial({
  color: new Color(
    formatHex(
      oklch(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-accent')
          .trim()
      )
    )
  ),
  // opacity is driven by fadeOut()
  transparent: true,
  // always display the ping in front of anything else
  // (prevents from being occluded by the beam itself)
  depthTest: false,
  depthWrite: false,

  side: FrontSide,
})
