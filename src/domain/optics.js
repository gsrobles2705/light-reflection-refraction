import { DEFAULT_DISPERSION, REFERENCE_WAVELENGTH_NM, SPEED_OF_LIGHT } from './constants.js'
import { toDegrees, toRadians } from './units.js'

/**
 * Effective refractive index at a given wavelength.
 *
 * Simplified dispersion model: n(λ) = n₀ + (n₀ − 1)·k·((λref/λ)² − 1).
 * It grows as the wavelength shortens, so blue bends more than red.
 * With `dispersive = false` the index is the tabulated n₀.
 */
export const effectiveIndex = (baseIndex, wavelengthNm, dispersive = true, dispersion = DEFAULT_DISPERSION) =>
  dispersive ? baseIndex + (baseIndex - 1) * dispersion * ((REFERENCE_WAVELENGTH_NM / wavelengthNm) ** 2 - 1) : baseIndex

/**
 * Snell's law: n₁·sin θ₁ = n₂·sin θ₂ (angles in radians).
 * Returns `{ totalInternalReflection, refractedAngle }`; no refracted ray exists
 * when sin θ₂ would reach 1.
 */
export function applySnellLaw(n1, n2, incidentAngle) {
  const sinRefracted = (n1 * Math.sin(incidentAngle)) / n2
  if (sinRefracted >= 1) return { totalInternalReflection: true, refractedAngle: Math.PI / 2 }
  return { totalInternalReflection: false, refractedAngle: Math.asin(sinRefracted) }
}

/** Refracted angle in degrees, or `null` when total internal reflection occurs. */
export function refractedAngleDegrees(n1, n2, incidentDegrees) {
  const { totalInternalReflection, refractedAngle } = applySnellLaw(n1, n2, toRadians(incidentDegrees))
  return totalInternalReflection ? null : toDegrees(refractedAngle)
}

/** Critical angle in degrees; only exists when light goes to a less dense medium. */
export const criticalAngleDegrees = (n1, n2) => (n1 > n2 ? toDegrees(Math.asin(n2 / n1)) : null)

/** Index of refraction from a measured pair of angles (degrees), n = n₁·sin θ₁ / sin θ₂. */
export const indexFromAngles = (incidentDegrees, refractedDegrees, incidentIndex = 1) =>
  (incidentIndex * Math.sin(toRadians(incidentDegrees))) / Math.sin(toRadians(refractedDegrees))

/** Speed of light (m/s) inside a medium of index `n`. */
export const speedInMedium = (index) => SPEED_OF_LIGHT / index

/**
 * Vector form of refraction. `direction` is a unit vector; `normal` is the unit
 * normal facing against it. Returns `null` on total internal reflection.
 */
export function refractDirection(direction, normal, n1, n2) {
  const cosIncident = -(direction[0] * normal[0] + direction[1] * normal[1])
  const ratio = n1 / n2
  const discriminant = 1 - ratio * ratio * (1 - cosIncident * cosIncident)
  if (discriminant < 0) return null
  const scale = ratio * cosIncident - Math.sqrt(discriminant)
  return [ratio * direction[0] + scale * normal[0], ratio * direction[1] + scale * normal[1]]
}

/** Mirror reflection of `direction` about a unit `normal`. */
export function reflectDirection(direction, normal) {
  const dot = direction[0] * normal[0] + direction[1] * normal[1]
  return [direction[0] - 2 * dot * normal[0], direction[1] - 2 * dot * normal[1]]
}

/** Lateral displacement (same unit as `thickness`) of a ray crossing a parallel-sided slab. */
export const slabLateralShift = (thickness, incidentAngle, refractedAngle) =>
  (thickness * Math.sin(incidentAngle - refractedAngle)) / Math.cos(refractedAngle)
