const DECIMAL_PATTERN = /^\d+(\.\d+)?$/

/**
 * Strict decimal parser for user input. Accepts "12", "12.5" and "12,5";
 * rejects anything else ("14.9abc", "1e1", "-3") by returning NaN.
 */
export function parseDecimal(text) {
  const normalized = String(text).trim().replace(',', '.')
  return DECIMAL_PATTERN.test(normalized) ? parseFloat(normalized) : NaN
}

/** Absolute percent error of `measured` relative to `expected`. */
export const percentError = (measured, expected) => (Math.abs(measured - expected) / expected) * 100

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
