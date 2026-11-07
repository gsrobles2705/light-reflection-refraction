import { INDEX } from './media.js'
import { indexFromAngles, refractedAngleDegrees } from './optics.js'
import { parseDecimal, percentError } from './numbers.js'

/** Incidence angles (degrees) of the real water experiment. */
export const EXPERIMENT_ANGLES = [20, 30, 45, 60]

/** Smallest / largest refracted angle a student can reasonably read on the protractor. */
const MEASURABLE_RANGE = { min: 2, max: 90 }

/**
 * One result row per incidence angle. Rows without a valid reading only carry
 * `incident` and `expected`; valid ones also carry `measured`, `index`, `errorPercent`.
 */
export function buildResultRows(rawReadings, angles = EXPERIMENT_ANGLES, mediumIndex = INDEX.water) {
  return angles.map((incident, i) => {
    const expected = refractedAngleDegrees(INDEX.air, mediumIndex, incident)
    const measured = parseDecimal(rawReadings[i])
    if (!(measured >= MEASURABLE_RANGE.min) || measured >= MEASURABLE_RANGE.max) return { incident, expected }
    const index = indexFromAngles(incident, measured)
    return { incident, expected, measured, index, errorPercent: percentError(index, mediumIndex) }
  })
}

export function averageIndex(rows) {
  const valid = rows.filter((row) => row.index)
  return valid.length ? valid.reduce((sum, row) => sum + row.index, 0) / valid.length : null
}

const TABLE_HEADER = ['θ1 (aire) °', 'θ2 teórico °', 'θ2 medido °', 'n medido', 'error %']

/** Table of strings ready to export (header included). */
const resultsTable = (rows) => [
  TABLE_HEADER,
  ...rows.map((row) => [row.incident, row.expected.toFixed(1), row.measured ?? '', row.index ? row.index.toFixed(3) : '', row.errorPercent != null ? row.errorPercent.toFixed(1) : '']),
]

/** Tab-separated text, convenient to paste into a spreadsheet. */
export const toTsv = (rows) => resultsTable(rows).map((line) => line.join('\t')).join('\n')

/** Comma-separated text with a BOM so Excel opens accents correctly. */
export const toCsv = (rows) => '\ufeff' + resultsTable(rows).map((line) => line.join(',')).join('\n')
