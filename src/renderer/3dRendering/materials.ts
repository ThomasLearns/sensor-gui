import { formatHex, oklch } from 'culori'
import {
  Color,
  CustomBlending,
  DoubleSide,
  FrontSide,
  MaxEquation,
  MeshBasicMaterial,
  MinEquation,
  NoBlending,
  NormalBlending,
} from 'three'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'

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

// get the accent color from the css
const accentColor = new Color(
  formatHex(
    oklch(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim()
    )
  )
)

// material used for displaying pings
export const pingMaterial = new MeshBasicMaterial({
  color: accentColor,

  // opacity is driven by fadeOut()
  transparent: true,
  // always display the ping in front of anything else
  // (prevents from being occluded by the beam itself)
  depthWrite: false,

  side: DoubleSide,
})

// ping color, but a line material for when this type is needed
export const pingLineMaterial = new LineMaterial({
  linewidth: 3,
  color: accentColor,
  transparent: true,
  depthWrite: false,
})
