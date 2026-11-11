import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseDecimal, percentError } from '../src/domain/numbers.js'

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
