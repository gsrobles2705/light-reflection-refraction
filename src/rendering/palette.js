const CSS_VARIABLES = { bg: '--bg', a: '--a', b: '--b', ray: '--ray', ink: '--ink', mute: '--mute', err: '--err', at: '--at', bt: '--bt', rayT: '--ray-t' }

/**
 * Reads the active theme colors from CSS custom properties. Canvas drawing can't use
 * `var(--x)`, so renderers receive this plain object instead.
 */
export function readCanvasPalette() {
  const style = getComputedStyle(document.documentElement)
  return Object.fromEntries(Object.entries(CSS_VARIABLES).map(([key, variable]) => [key, style.getPropertyValue(variable).trim()]))
}
