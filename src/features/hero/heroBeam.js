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

/** Number of wavelength samples that paint the continuous spectrum wedge (red first). */
export const WEDGE_SAMPLES = 48
const WEDGE_RED_NM = 680, WEDGE_VIOLET_NM = 410
/** Inside the glass the colors have only started to separate: a small share of the spread they have after the exit. */
const INSIDE_HALF_SPREAD = 0.03

/** Wavelength (nm) of wedge sample `j`, from red to violet. */
export const wedgeWavelength = (j) => WEDGE_RED_NM + ((WEDGE_VIOLET_NM - WEDGE_RED_NM) * j) / (WEDGE_SAMPLES - 1)

const distanceToSegment = (point, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(point[0] - (a[0] + t * dx), point[1] - (a[1] + t * dy))
}

/** The prism edge closest to `point` (the face the beam leaves through), as [start, end]. */
function nearestEdge(vertices, point) {
  let best = null, bestDistance = Infinity
  vertices.forEach((vertex, i) => {
    const next = vertices[(i + 1) % vertices.length], distance = distanceToSegment(point, vertex, next)
    if (distance < bestDistance) { bestDistance = distance; best = [vertex, next] }
  })
  return best
}

/** Point where the ray (origin, angle) crosses the infinite line through a and b, or null when they are parallel. */
function crossLine(origin, angle, a, b) {
  const rx = Math.cos(angle), ry = Math.sin(angle), ex = b[0] - a[0], ey = b[1] - a[1], denominator = rx * ey - ry * ex
  if (Math.abs(denominator) < 1e-9) return null
  const t = ((a[0] - origin[0]) * ey - (a[1] - origin[1]) * ex) / denominator
  return t > 0 ? [origin[0] + rx * t, origin[1] + ry * t] : null
}

/**
 * The spectrum as a continuous wedge. Every sample is `{ start, angle }`: where that color meets the exit face and the
 * direction it leaves in. Inside the glass the colors already fan out a little (from the entry point to their own `start`)
 * and after the face they spread much more, which is what a real prism does.
 */
export function spectrumRays(exit, rotation, spreadScale = 1) {
  const face = nearestEdge(rotateVertices(HERO_PRISM_VERTICES, rotation), exit.to)
  const insideAngle = Math.atan2(exit.to[1] - exit.from[1], exit.to[0] - exit.from[0]), outAngle = Math.atan2(exit.direction[1], exit.direction[0]), side = outAngle < 0 ? -1 : 1
  return Array.from({ length: WEDGE_SAMPLES }, (_, j) => {
    const u = -1 + (2 * j) / (WEDGE_SAMPLES - 1)
    return { start: (face && crossLine(exit.from, insideAngle + side * u * INSIDE_HALF_SPREAD, face[0], face[1])) || exit.to, angle: outAngle + side * u * FAN_HALF_SPREAD * spreadScale }
  })
}

/** Brightness of each wedge sample: the eye (and a real spectrum on a dark wall) is dimmer at the violet and red ends. */
export const wedgeWeight = (j) => {
  const t = j / (WEDGE_SAMPLES - 1), ends = Math.min(t, 1 - t)
  return 0.5 + 0.5 * Math.min(1, ends / 0.22)
}
