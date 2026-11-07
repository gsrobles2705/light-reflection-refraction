import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PRISM_STORY } from '../src/content/prismLab.js'
import { buildPrismGeometry, colorsRecombine, DEFAULT_PRISM_SETTINGS, findComfortableRotation, traceWavelength, WHITE_LIGHT_WAVELENGTHS } from '../src/domain/prism.js'
import { PRISM_MATERIALS } from '../src/domain/media.js'

const near = (actual, expected, tolerance = 0.05) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`)
const settings = (changes = {}) => ({ ...DEFAULT_PRISM_SETTINGS, ...changes })
const trace = (changes, nm = 550) => { const s = settings(changes); return traceWavelength(s, nm, buildPrismGeometry(s)) }
const stepSettings = (step) => { const s = settings(step.settings); return s.rotation === 'min' ? { ...s, rotation: findComfortableRotation(s) } : s }

test('geometry: an isosceles prism with the requested apex angle', () => {
  const { polygons: [[apex, left, right]] } = buildPrismGeometry(settings({ apexAngle: 60, rotation: 0 }))
  const angleAt = (vertex, a, b) => Math.acos(((a[0] - vertex[0]) * (b[0] - vertex[0]) + (a[1] - vertex[1]) * (b[1] - vertex[1])) / (Math.hypot(a[0] - vertex[0], a[1] - vertex[1]) * Math.hypot(b[0] - vertex[0], b[1] - vertex[1]))) * 180 / Math.PI
  near(angleAt(apex, left, right), 60, 1e-6)
  near(Math.hypot(apex[0] - left[0], apex[1] - left[1]), Math.hypot(apex[0] - right[0], apex[1] - right[1]), 1e-6)
})

test('geometry: a Newton pair adds a second, inverted prism', () => {
  assert.equal(buildPrismGeometry(settings({ newtonPair: false })).polygons.length, 1)
  assert.equal(buildPrismGeometry(settings({ newtonPair: true })).polygons.length, 2)
})

test('minimum deviation of the flint prism (A = 40°) matches theory: 27.3°', () => {
  const flint = { material: PRISM_MATERIALS.findIndex((m) => m.id === 'flint'), apexAngle: 40, dispersion: false, whiteLight: false, laserY: 170 }
  const rotation = findComfortableRotation(settings(flint))
  const { deviation, exitAngle } = trace({ ...flint, rotation })
  assert.notEqual(exitAngle, null)
  near(Math.abs(deviation), 27.3, 0.15)
})

test('dispersion: violet deviates more than red for a simple two-refraction path', () => {
  const crown = { material: 0, apexAngle: 40, dispersion: true, newtonPair: false }
  let compared = 0
  for (let rotation = -20; rotation <= 40; rotation += 2) {
    const red = trace({ ...crown, rotation }, 680), violet = trace({ ...crown, rotation }, 400)
    if (red.points.length === 3 && violet.points.length === 3) {
      compared++
      assert.ok(Math.abs(violet.deviation) >= Math.abs(red.deviation), `rotation ${rotation}°`)
    }
  }
  assert.ok(compared > 10, 'the sweep must include enough clean paths to be meaningful')
})

test('guided steps: every color leaves the prism in steps 2–4', () => {
  for (const index of [1, 2, 3]) {
    const s = stepSettings(PRISM_STORY[index]), geometry = buildPrismGeometry(s)
    const exits = (s.whiteLight ? WHITE_LIGHT_WAVELENGTHS : [s.wavelength]).map((nm) => traceWavelength(s, nm, geometry).exitAngle)
    assert.ok(exits.every((angle) => angle != null), `step ${index + 1}`)
  }
})

test("Newton's experiment (last guided step): the colors recombine into parallel rays", () => {
  const s = stepSettings(PRISM_STORY[4])
  assert.equal(s.newtonPair, true)
  assert.equal(colorsRecombine(s, buildPrismGeometry(s)), true)
  // Rotating the pair as one rigid block keeps its outer faces parallel, so the colors still recombine...
  const rotated = { ...s, rotation: s.rotation + 30 }
  assert.equal(colorsRecombine(rotated, buildPrismGeometry(rotated)), true)
  // ...but a beam that passes below the pair never refracts, so there is nothing to recombine
  const missed = { ...s, laserY: 400 }
  assert.equal(colorsRecombine(missed, buildPrismGeometry(missed)), false)
})

test('a hidden prism leaves the beam straight', () => {
  const { points, deviation } = trace({ prismHidden: true })
  assert.equal(points.length, 1)
  near(deviation, 0, 1e-9)
})
