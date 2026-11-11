import { effectiveIndex, criticalAngleDegrees } from '../../domain/optics.js'
import { INDEX, indexOfMedium } from '../../domain/media.js'

const mediumIndexOf = (id) => indexOfMedium(id)

/**
 * Ready-made cases ("presets"). `apply(scene)` returns the scene fields that case changes; the critical-angle
 * case depends on the current color and dispersion, hence the argument.
 */
export const SCENARIOS = [
  { id: 'air-to-water', icon: 'drop', label: 'Aire → agua', description: 'La luz entra al agua y se acerca a la vertical.', apply: () => ({ firstMedium: mediumIndexOf('air'), secondMedium: mediumIndexOf('water'), incidentAngle: 45, mode: 'interface' }) },
  { id: 'water-to-air', icon: 'arrowUp', label: 'Agua → aire', description: 'Sale del agua y se aleja de la vertical.', apply: () => ({ firstMedium: mediumIndexOf('water'), secondMedium: mediumIndexOf('air'), incidentAngle: 35, mode: 'interface' }) },
  {
    id: 'critical-angle', icon: 'angle', label: 'Ángulo crítico', description: 'El rayo sale rasante, pegado a la superficie.',
    apply: ({ wavelength, dispersion }) => {
      const glass = effectiveIndex(INDEX.glass, wavelength, dispersion), air = effectiveIndex(INDEX.air, wavelength, dispersion)
      return { firstMedium: mediumIndexOf('glass'), secondMedium: mediumIndexOf('air'), incidentAngle: criticalAngleDegrees(glass, air) - 1e-5, mode: 'interface' }   // exactly the critical angle (a hair below, so the ray still leaves): it skims along the surface, θ₂ ≈ 90°
    },
  },
  { id: 'total-reflection', icon: 'fiber', label: 'Reflexión total', description: 'Toda la luz rebota, como en la fibra óptica.', apply: () => ({ firstMedium: mediumIndexOf('water'), secondMedium: mediumIndexOf('air'), incidentAngle: 65, mode: 'interface' }) },
  { id: 'glass-slab', icon: 'layers', label: 'Placa de vidrio', description: 'La luz atraviesa el vidrio y sale desplazada.', apply: () => ({ firstMedium: mediumIndexOf('air'), secondMedium: mediumIndexOf('glass'), incidentAngle: 55, mode: 'slab' }) },
  { id: 'diamond', icon: 'gem', label: 'Diamante', description: 'Dobla mucho la luz: de ahí su brillo.', apply: () => ({ firstMedium: mediumIndexOf('air'), secondMedium: mediumIndexOf('diamond'), incidentAngle: 50, mode: 'interface' }) },
]

