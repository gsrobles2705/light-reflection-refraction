import assert from 'node:assert/strict'
import { test } from 'node:test'
import { averageIndex, buildResultRows, EXPERIMENT_ANGLES, toCsv, toTsv } from '../src/domain/experiment.js'
import { parseDecimal, percentError } from '../src/domain/numbers.js'
import { INDEX } from '../src/domain/media.js'

const near = (actual, expected, tolerance = 0.01) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`)

test('parseDecimal accepts plain numbers with dot or comma and rejects everything else', () => {
  assert.equal(parseDecimal('12'), 12)
  assert.equal(parseDecimal(' 14.9 '), 14.9)
  assert.equal(parseDecimal('9,5'), 9.5)
  for (const bad of ['', 'abc', '14.9abc', '1e1', '-3', '1.2.3', '.5', '5.', 'Infinity']) assert.ok(Number.isNaN(parseDecimal(bad)), JSON.stringify(bad))
})

test('percentError is relative and unsigned', () => {
  near(percentError(1.4, 1.333), 5.03, 0.01)
  near(percentError(1.26, 1.333), 5.48, 0.01)
})

test('expected refracted angles for 20°, 30°, 45° and 60° in water', () => {
  const rows = buildResultRows(['', '', '', ''])
  assert.deepEqual(rows.map((row) => row.incident), EXPERIMENT_ANGLES)
  rows.forEach((row, i) => near(row.expected, [14.87, 22.03, 32.04, 40.52][i], 0.01))
})

test('a perfect reading gives n = 1.333 and 0 % error', () => {
  const [row] = buildResultRows(['14.87'], [20])
  near(row.index, INDEX.water, 0.002)
  near(row.errorPercent, 0, 0.2)
})

test('invalid readings leave the row without results', () => {
  for (const bad of ['', 'abc', '0', '-5', '1', '90', '95', '14.9abc']) {
    const [row] = buildResultRows([bad], [20])
    assert.equal(row.index, undefined, JSON.stringify(bad))
  }
})

test('average index ignores empty rows', () => {
  assert.equal(averageIndex(buildResultRows(['', '', '', ''])), null)
  const rows = buildResultRows(['14.87', '', '32.04', ''])
  near(averageIndex(rows), INDEX.water, 0.003)
})

test('exports: TSV for spreadsheets, CSV with BOM, same cells', () => {
  const rows = buildResultRows(['14.87', '', '', ''])
  const tsv = toTsv(rows), csv = toCsv(rows)
  assert.equal(tsv.split('\n').length, 5)
  assert.ok(csv.startsWith('\ufeff'))
  assert.equal(csv.slice(1).replaceAll(',', '\t'), tsv)
})
