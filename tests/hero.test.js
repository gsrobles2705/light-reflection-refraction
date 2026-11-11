import assert from 'node:assert/strict'
import { test } from 'node:test'
import { BEAM_DIRECTION, FAN_WAVELENGTHS, WEDGE_SAMPLES, fanAngles, spectrumRays, traceHeroBeam } from '../src/features/hero/heroBeam.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

test('the hero beam leaves cleanly (and all colors fan out) for almost every pointer position', () => {
  let clean = 0, total = 0
  for (let x = 0; x <= 1.001; x += 0.05) for (let y = 0; y <= 1.001; y += 0.1) for (const wobble of [-0.04, 0, 0.04]) {
    total++
    if (traceHeroBeam((x - 0.5) * 0.5 + wobble, clamp(-0.1 + (0.5 - y), -0.5, 0.8)).exit) clean++
  }
  assert.ok(clean / total > 0.9, `only ${(100 * clean / total).toFixed(0)} % of positions give a clean fan`)
})

test('the resting pose has a clean exit', () => {
  assert.ok(traceHeroBeam((0.62 - 0.5) * 0.5, -0.1).exit)
})

test('the beam travels up and to the right before the prism', () => {
  assert.ok(BEAM_DIRECTION[0] > 0 && BEAM_DIRECTION[1] > 0)
})

test('the fan has one direction per color, and violet bends the most (away from the original beam)', () => {
  const { exit } = traceHeroBeam(0.06, -0.1)
  const angles = fanAngles(exit.direction)
  assert.equal(angles.length, FAN_WAVELENGTHS.length)
  const bendsDownward = Math.atan2(exit.direction[1], exit.direction[0]) < 0
  const bending = bendsDownward ? angles.map((angle) => -angle) : angles   // larger = bends more
  for (let i = 1; i < bending.length; i++) assert.ok(bending[i] > bending[i - 1], 'each color (red → violet) must bend more than the previous one')
})

test('the spectrum wedge has no gaps: the colors start together on the exit face and only then spread out', () => {
  const rotation = 0.06, { exit } = traceHeroBeam(rotation, -0.1), rays = spectrumRays(exit, rotation)
  assert.equal(rays.length, WEDGE_SAMPLES)
  const gap = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
  const first = rays[0], last = rays[rays.length - 1]
  const near = gap(first.start, last.start)
  assert.ok(near < 0.35, `colors must leave the face close together (spread ${near.toFixed(2)})`)
  const farPoint = (ray, distance) => [ray.start[0] + Math.cos(ray.angle) * distance, ray.start[1] + Math.sin(ray.angle) * distance]
  assert.ok(gap(farPoint(first, 8), farPoint(last, 8)) > near * 5, 'the band must widen with distance')
  for (let i = 1; i < rays.length; i++) assert.ok(Math.abs(rays[i].angle - rays[i - 1].angle) < 0.02, 'neighbouring colors differ by a tiny angle')
})
