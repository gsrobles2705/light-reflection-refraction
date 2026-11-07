import { indexOfMedium } from '../domain/media.js'
import { REFERENCE_WAVELENGTH_NM } from '../domain/constants.js'
import { solveInterface, SLAB_THICKNESS_CM } from '../domain/interfaceModel.js'

// Scene → drawable model of the simulator: the physics of the interface (domain/interfaceModel.js) plus the canvas
// layout of the rays. The renderer and the simulator feature both consume it.

/** Logical canvas coordinates of the simulator. */
export const CANVAS = Object.freeze({ width: 900, height: 460, centerX: 450, pixelsPerCm: 20, slabHeight: SLAB_THICKNESS_CM * 20 })

/** Longest ray segment drawn, and the margin kept to the canvas edges. */
const MAX_RAY_LENGTH = 210
const EDGE_MARGIN = 8
/**
 * Beams are drawn with a visual weight: normally the reflected one is dimmer than the transmitted one, and under
 * total internal reflection the reflected ray carries everything. Purely cosmetic, not a Fresnel computation.
 */
const REFLECTED_WEIGHT = 0.15
const TRANSMITTED_WEIGHT = 0.85
/** Keeps near-horizontal rays from producing infinite segments. */
const MIN_COSINE = 0.05

export const DEFAULT_SCENE = Object.freeze({
  firstMedium: indexOfMedium('air'),
  secondMedium: indexOfMedium('water'),
  incidentAngle: 40,
  wavelength: REFERENCE_WAVELENGTH_NM,
  mode: 'interface',     // 'interface' (two media) | 'slab' (parallel-sided plate)
  showArcs: true,
  showProtractor: true,
  dispersion: true,
  showNames: true,
})

/**
 * Ray segments in canvas coordinates. `weight` (0–1) drives brightness, `index` is the medium's
 * refractive index (wavefront speed) and `isExit` marks the ray leaving a slab.
 */
function buildRaySegments(physics, mode, surfaceY, slabBottomY) {
  const { height, centerX, slabHeight } = CANVAS
  const sin = Math.sin(physics.incident), cos = Math.max(Math.cos(physics.incident), MIN_COSINE)
  const upLength = Math.min(MAX_RAY_LENGTH, (surfaceY - EDGE_MARGIN) / cos)   // rays never leave the canvas
  const segments = [
    { x1: centerX - sin * upLength, y1: surfaceY - cos * upLength, x2: centerX, y2: surfaceY, weight: 1, index: physics.n1 },
    { x1: centerX, y1: surfaceY, x2: centerX + sin * upLength, y2: surfaceY - cos * upLength, weight: physics.totalInternalReflection ? 1 : REFLECTED_WEIGHT, index: physics.n1 },
  ]
  if (physics.totalInternalReflection) return segments

  const refractedCos = Math.max(Math.cos(physics.refractedAngle), MIN_COSINE)
  if (mode === 'slab') {
    const exitX = centerX + Math.tan(physics.refractedAngle) * slabHeight
    const outLength = Math.min(MAX_RAY_LENGTH, (height - EDGE_MARGIN - slabBottomY) / cos)
    segments.push({ x1: centerX, y1: surfaceY, x2: exitX, y2: slabBottomY, weight: TRANSMITTED_WEIGHT, index: physics.n2 })
    segments.push({ x1: exitX, y1: slabBottomY, x2: exitX + sin * outLength, y2: slabBottomY + cos * outLength, weight: TRANSMITTED_WEIGHT ** 2, index: physics.n1, isExit: true })
  } else {
    const length = Math.min(MAX_RAY_LENGTH, (height - EDGE_MARGIN - surfaceY) / refractedCos)
    segments.push({ x1: centerX, y1: surfaceY, x2: centerX + Math.sin(physics.refractedAngle) * length, y2: surfaceY + refractedCos * length, weight: TRANSMITTED_WEIGHT, index: physics.n2 })
  }
  return segments
}

/** Everything the renderer and the readouts need for a scene: physics plus layout. */
export function buildSimulatorModel(scene) {
  const physics = solveInterface({ firstMedium: scene.firstMedium, secondMedium: scene.secondMedium, incidentAngle: scene.incidentAngle, wavelength: scene.wavelength, mode: scene.mode, dispersion: scene.dispersion })
  const surfaceY = scene.mode === 'slab' ? 165 : 240
  const slabBottomY = surfaceY + CANVAS.slabHeight
  return { ...physics, surfaceY, slabBottomY, segments: buildRaySegments(physics, scene.mode, surfaceY, slabBottomY) }
}
