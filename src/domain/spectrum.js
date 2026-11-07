/**
 * Approximate RGB (0–255) of a visible wavelength in nm, with the usual
 * intensity roll-off at both ends of the visible range.
 */
export function wavelengthToRgb(nm) {
  let red = 0, green = 0, blue = 0
  if (nm < 440) { red = (440 - nm) / 60; blue = 1 }
  else if (nm < 490) { green = (nm - 440) / 50; blue = 1 }
  else if (nm < 510) { green = 1; blue = (510 - nm) / 20 }
  else if (nm < 580) { red = (nm - 510) / 70; green = 1 }
  else if (nm < 645) { red = 1; green = (645 - nm) / 65 }
  else { red = 1 }
  const rolloff = nm < 420 ? 0.4 + (0.6 * (nm - 380)) / 40 : nm > 700 ? 0.4 + (0.6 * (780 - nm)) / 80 : 1
  const channel = (value) => Math.round(255 * Math.pow(Math.max(0, value) * rolloff, 0.8))
  return [channel(red), channel(green), channel(blue)]
}

export const wavelengthToCss = (nm) => `rgb(${wavelengthToRgb(nm).join(',')})`

/** Spanish color name (lowercase) for a wavelength in nm. */
export function colorNameForWavelength(nm) {
  if (nm < 450) return 'violeta'
  if (nm < 495) return 'azul'
  if (nm < 520) return 'cian'
  if (nm < 565) return 'verde'
  if (nm < 590) return 'amarillo'
  if (nm < 625) return 'naranja'
  return 'rojo'
}
