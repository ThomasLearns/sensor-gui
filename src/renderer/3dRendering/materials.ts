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

// Color constants for beam states
export const BEAM_COLOR_CONNECTED = new Color(0x00ff00) // Green when connected
export const BEAM_COLOR_DISCONNECTED = new Color(0xff0000) // Red when disconnected
const BEAM_OPACITY = 0.2

// Create a beam material with a specific color
export function createBeamMaterial(color: Color): MeshBasicMaterial {
  return new MeshBasicMaterial({
    color: color.clone(),
    opacity: BEAM_OPACITY,
    transparent: true,
  })
}

// Default beam material (kept for backward compatibility)
export const beamMaterial = createBeamMaterial(BEAM_COLOR_DISCONNECTED)

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