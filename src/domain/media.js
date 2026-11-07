/**
 * Optical media used across the project. `index` is the refractive index at the
 * reference wavelength (550 nm). Ids are stable identifiers; `name` is UI text.
 */
export const MEDIA = [
  { id: 'air', name: 'Aire', index: 1.0 },
  { id: 'ice', name: 'Hielo', index: 1.31 },
  { id: 'water', name: 'Agua', index: 1.333 },
  { id: 'glycerin', name: 'Glicerina', index: 1.47 },
  { id: 'acrylic', name: 'Acrílico', index: 1.49 },
  { id: 'glass', name: 'Vidrio', index: 1.52 },
  { id: 'diamond', name: 'Diamante', index: 2.42 },
]

/** Refractive index by medium id, e.g. `INDEX.water`. */
export const INDEX = Object.fromEntries(MEDIA.map((medium) => [medium.id, medium.index]))

export const indexOfMedium = (id) => MEDIA.findIndex((medium) => medium.id === id)

/**
 * Prism materials. `dispersion` scales the simplified n(λ) model, so each
 * material spreads colors by a different amount.
 */
export const PRISM_MATERIALS = [
  { id: 'crown', name: 'Vidrio crown', index: 1.52, dispersion: 0.03 },
  { id: 'flint', name: 'Vidrio flint', index: 1.62, dispersion: 0.05 },
  { id: 'diamond', name: 'Diamante', index: 2.42, dispersion: 0.036 },
  { id: 'water', name: 'Agua', index: 1.333, dispersion: 0.03 },
]
