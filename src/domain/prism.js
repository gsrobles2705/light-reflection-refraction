import { PRISM_MATERIALS } from './media.js'
import { effectiveIndex } from './optics.js'
import { traceThroughPolygons } from './rayTracing.js'
import { toDegrees, toRadians } from './units.js'

/**
 * Logical coordinate system of the prism lab (pixels of its canvas).
 * The laser sits at the left, the screen at the right.
 */
export const PRISM_LAB = Object.freeze({ width: 900, height: 460, screenX: 868, laserX: 74, prismHeight: 150, centerY: 235, centerX: 450, centerXWithPair: 300 })

/** Wavelengths (nm) sampled to represent white light: 400…700 nm in 15 nm steps. */
export const WHITE_LIGHT_WAVELENGTHS = Array.from({ length: 21 }, (_, i) => 400 + i * 15)

/** Initial / reset settings of the prism lab. */
export const DEFAULT_PRISM_SETTINGS = Object.freeze({
  material: 1,            // index into PRISM_MATERIALS
  apexAngle: 40,          // degrees
  rotation: 13.7,         // degrees
  laserY: 170,
  laserAngle: 0,          // degrees from the horizontal
  whiteLight: true,
  wavelength: 550,
  dispersion: true,
  newtonPair: false,      // second, inverted prism (Newton's experiment)
  pairGap: 20,
  prismHidden: false,
})

const FALLBACK_ROTATION = 13.7
const ROTATION_SEARCH = { from: -60, to: 60, step: 0.25 }
const PARALLEL_TOLERANCE = toRadians(0.6)

/**
 * Prism polygons. An isosceles prism with apex angle A (apex up) is centered at
 * `center` and rotated by `rotation`. With a Newton pair, the second prism is the
 * first one rotated 180° and glued to its right face (parallel faces, so light
 * leaves parallel to the original beam).
 */
export function buildPrismGeometry(settings) {
  const { apexAngle, rotation, newtonPair, pairGap, centerX } = settings
  const center = [centerX ?? (newtonPair ? PRISM_LAB.centerXWithPair : PRISM_LAB.centerX), PRISM_LAB.centerY]
  const half = PRISM_LAB.prismHeight * Math.tan(toRadians(apexAngle / 2))
  const angle = toRadians(rotation), cos = Math.cos(angle), sin = Math.sin(angle)
  const vertices = [[0, (-PRISM_LAB.prismHeight * 2) / 3], [-half, PRISM_LAB.prismHeight / 3], [half, PRISM_LAB.prismHeight / 3]]
    .map(([x, y]) => [center[0] + x * cos - y * sin, center[1] + x * sin + y * cos])
  if (!newtonPair) return { center, polygons: [vertices] }

  const mid = [(vertices[2][0] + vertices[0][0]) / 2, (vertices[2][1] + vertices[0][1]) / 2]
  const edgeX = vertices[0][0] - vertices[2][0], edgeY = vertices[0][1] - vertices[2][1], length = Math.hypot(edgeX, edgeY)
  let nx = edgeY / length, ny = -edgeX / length
  if (nx * (vertices[2][0] - center[0]) + ny * (vertices[2][1] - center[1]) < 0) { nx = -nx; ny = -ny }
  const second = vertices.map((v) => [2 * mid[0] + nx * pairGap - v[0], 2 * mid[1] + ny * pairGap - v[1]])
  return { center, polygons: [vertices, second] }
}

/** Traces one wavelength through the prism(s); also returns n and the total deviation (degrees). */
export function traceWavelength(settings, wavelengthNm, geometry) {
  const material = PRISM_MATERIALS[settings.material]
  const index = effectiveIndex(material.index, wavelengthNm, settings.dispersion, material.dispersion)
  const angle = toRadians(settings.laserAngle), start = [Math.cos(angle), Math.sin(angle)]
  const polygons = settings.prismHidden ? [] : geometry.polygons
  const trace = traceThroughPolygons(polygons, index, [PRISM_LAB.laserX, settings.laserY], start)
  const deviation = toDegrees(Math.atan2(start[0] * trace.direction[1] - start[1] * trace.direction[0], start[0] * trace.direction[0] + start[1] * trace.direction[1]))
  return { ...trace, index, deviation }
}

/**
 * Prism rotation (degrees) that makes the beam leave cleanly with the smallest
 * deviation, found by a brute-force sweep with the same tracer. Used to place
 * the prism in the guided steps.
 */
export function findComfortableRotation(settings) {
  let best = null
  for (let rotation = ROTATION_SEARCH.from; rotation <= ROTATION_SEARCH.to; rotation += ROTATION_SEARCH.step) {
    const candidate = { ...settings, rotation, newtonPair: false, prismHidden: false }
    const trace = traceWavelength(candidate, 550, buildPrismGeometry(candidate))
    const leavesCleanly = trace.exitAngle != null && trace.points.length === 3
    if (leavesCleanly && (!best || Math.abs(trace.deviation) < best.deviation)) best = { rotation, deviation: Math.abs(trace.deviation) }
  }
  return best ? best.rotation : FALLBACK_ROTATION
}

/** True when every sampled color exits the Newton pair parallel to the others (they recombine into white). */
export function colorsRecombine(settings, geometry) {
  const traces = WHITE_LIGHT_WAVELENGTHS.map((nm) => traceWavelength(settings, nm, geometry))
  if (!traces.every((trace) => trace.exitAngle != null)) return false
  const headings = traces.map((trace) => Math.atan2(trace.direction[1], trace.direction[0]))
  return Math.max(...headings) - Math.min(...headings) < PARALLEL_TOLERANCE
}
