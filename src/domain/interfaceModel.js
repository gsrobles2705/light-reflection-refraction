import { MEDIA } from './media.js'
import { applySnellLaw, criticalAngleDegrees, effectiveIndex, slabLateralShift } from './optics.js'
import { toDegrees, toRadians } from './units.js'

/** Thickness of the glass slab shown by the simulator, in centimeters. */
export const SLAB_THICKNESS_CM = 6.5

/**
 * Physics of a light ray reaching the boundary between two media (or crossing a
 * parallel-sided slab). Pure: no drawing, no layout.
 *
 * @param {{ firstMedium:number, secondMedium:number, incidentAngle:number,
 *           wavelength:number, mode:'interface'|'slab', dispersion:boolean }} scene
 *        media are indices into MEDIA; `incidentAngle` is in degrees.
 */
export function solveInterface({ firstMedium, secondMedium, incidentAngle, wavelength, mode, dispersion }) {
  const n1 = effectiveIndex(MEDIA[firstMedium].index, wavelength, dispersion)
  const n2 = effectiveIndex(MEDIA[secondMedium].index, wavelength, dispersion)
  const incident = toRadians(incidentAngle)
  const { totalInternalReflection, refractedAngle } = applySnellLaw(n1, n2, incident)
  const lateralShiftCm = mode === 'slab' && !totalInternalReflection ? slabLateralShift(SLAB_THICKNESS_CM, incident, refractedAngle) : null
  return {
    n1,
    n2,
    incident,
    totalInternalReflection,
    refractedAngle,
    refractedDegrees: totalInternalReflection ? null : toDegrees(refractedAngle),
    criticalDegrees: criticalAngleDegrees(n1, n2),
    lateralShiftCm,
  }
}
