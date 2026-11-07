/** Highest device pixel ratio honored; beyond it the extra sharpness is not worth the fill-rate cost. */
const MAX_PIXEL_RATIO = 2
/** Phones/tablets fill far fewer pixels per frame at 1.5×, with almost no visible loss for line drawings. */
export const isTouchDevice = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
export const maxPixelRatio = () => (isTouchDevice() ? 1.5 : MAX_PIXEL_RATIO)
/** Highest text/handle scale applied when a canvas is displayed much smaller than its logical size. */
const MAX_DISPLAY_SCALE = 2.4

export const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Sizes the canvas backing store for the device pixel ratio and returns a 2D
 * context that draws in logical (width × height) coordinates.
 */
export function setupCanvas(canvas, width, height) {
  const ratio = Math.min(devicePixelRatio || 1, maxPixelRatio())
  canvas.width = width * ratio
  canvas.height = height * ratio
  const context = canvas.getContext('2d')
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  return context
}

/** Converts viewport coordinates to the canvas' logical coordinate system. */
export function clientToCanvas(canvas, clientX, clientY, width, height) {
  const rect = canvas.getBoundingClientRect()
  return [((clientX - rect.left) * width) / rect.width, ((clientY - rect.top) * height) / rect.height]
}

/**
 * Factor (≥ 1) to enlarge text and handles so they stay legible when the canvas
 * is shown smaller than its logical width (e.g. on phones).
 */
export const displayScale = (canvas, width) => Math.min(MAX_DISPLAY_SCALE, Math.max(1, width / (canvas.clientWidth || width)))
