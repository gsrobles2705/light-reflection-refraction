import { effectiveIndex } from '../../domain/optics.js'
import { traceThroughPolygons } from '../../domain/rayTracing.js'

// Geometry and optics of the hero's decorative prism. The beam and the color fan are computed with the same Snell
// tracer as the labs, but dispersion is deliberately exaggerated (see DISPERSION) so the colors are easy to tell apart.

const SIDE = 2.6
const HEIGHT = (SIDE * Math.sqrt(3)) / 2

/** Equilateral triangle, apex up, centered on the origin (world units). */
export const HERO_PRISM_VERTICES = [[0, (HEIGHT * 2) / 3], [-SIDE / 2, -HEIGHT / 3], [SIDE / 2, -HEIGHT / 3]]
const GLASS_INDEX = 1.5
const DISPERSION = 0.3
const REFERENCE_NM = 550

/** Wavelengths of the fan, red first. */
export const FAN_WAVELENGTHS = [680, 620, 580, 540, 490, 450, 410]
/** Angular half-spread of the fan (radians) between the central ray and the extreme colors. */
const FAN_HALF_SPREAD = 0.17
const CENTER_INDEX = (FAN_WAVELENGTHS.length - 1) / 2

/**
 * The beam enters rising from the lower left (~21°) and the prism stays upright: that way all seven colors leave
 * through the right face for almost every pointer position.
 */
const BEAM_ANGLE = 0.366
export const BEAM_DIRECTION = [Math.cos(BEAM_ANGLE), Math.sin(BEAM_ANGLE)]
const BEAM_START_X = -7
const AIM_X = -1   // x where the beam is aimed at the left face when the prism is unrotated

const rotateVertices = (vertices, angle) => {
  const cos = Math.cos(angle), sin = Math.sin(angle)
  return vertices.map(([x, y]) => [x * cos - y * sin, x * sin + y * cos])
}

/** Where the beam starts, for a given entry height at the prism's left face. */
const beamOrigin = (entryHeight) => [BEAM_START_X, entryHeight - (AIM_X - BEAM_START_X) * Math.tan(BEAM_ANGLE)]

/**
 * Traces the central (green) ray through the prism rotated by `rotation`.
 * Returns `{ origin, entry, exit }`: `entry` is where the beam meets the glass (or null if it misses) and `exit`
 * is `{ from, to, direction }` for the inside segment and outgoing direction when the ray leaves cleanly
 * (two surface hits), otherwise null.
 */
export function traceHeroBeam(rotation, entryHeight) {
  const origin = beamOrigin(entryHeight)
  const trace = traceThroughPolygons([rotateVertices(HERO_PRISM_VERTICES, rotation)], effectiveIndex(GLASS_INDEX, REFERENCE_NM, true, DISPERSION), origin, BEAM_DIRECTION)
  const cleanExit = trace.points.length === 3
  return { origin, entry: trace.points[1] || null, exit: cleanExit ? { from: trace.points[1], to: trace.points[2], direction: trace.direction } : null }
}

/** Directions (radians) of the seven colors, spread around the central direction; violet bends the most. */
export function fanAngles(centralDirection) {
  const base = Math.atan2(centralDirection[1], centralDirection[0]), side = base < 0 ? -1 : 1
  return FAN_WAVELENGTHS.map((_, i) => base + side * ((i - CENTER_INDEX) / CENTER_INDEX) * FAN_HALF_SPREAD)
}
