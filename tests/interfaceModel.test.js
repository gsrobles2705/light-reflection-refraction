import assert from 'node:assert/strict'
import { test } from 'node:test'
import { indexOfMedium } from '../src/domain/media.js'
import { solveInterface } from '../src/domain/interfaceModel.js'
import { buildSimulatorModel, CANVAS, DEFAULT_SCENE } from '../src/rendering/simulatorModel.js'
import { SCENARIOS } from '../src/features/simulator/scenarios.js'
import { explainScene } from '../src/features/simulator/explanation.js'

const near = (actual, expected, tolerance = 0.01) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`)
const scene = (changes = {}) => ({ ...DEFAULT_SCENE, dispersion: false, ...changes })
const idx = (id) => indexOfMedium(id)

test('air → water at 40°', () => {
  const physics = solveInterface({ firstMedium: idx('air'), secondMedium: idx('water'), incidentAngle: 40, wavelength: 550, mode: 'interface', dispersion: false })
  near(physics.refractedDegrees, 28.83)
  assert.equal(physics.totalInternalReflection, false)
  assert.equal(physics.criticalDegrees, null)
})

test('water → air beyond the critical angle: total internal reflection, no refracted angle', () => {
  const physics = solveInterface({ firstMedium: idx('water'), secondMedium: idx('air'), incidentAngle: 60, wavelength: 550, mode: 'interface', dispersion: false })
  assert.equal(physics.totalInternalReflection, true)
  assert.equal(physics.refractedDegrees, null)
  near(physics.criticalDegrees, 48.61)
})

test('slab mode reports a lateral shift only when light crosses', () => {
  const crossing = solveInterface({ firstMedium: idx('air'), secondMedium: idx('glass'), incidentAngle: 55, wavelength: 550, mode: 'slab', dispersion: false })
  near(crossing.lateralShiftCm, 2.939, 0.002)
  const trapped = solveInterface({ firstMedium: idx('glass'), secondMedium: idx('air'), incidentAngle: 60, wavelength: 550, mode: 'slab', dispersion: false })
  assert.equal(trapped.lateralShiftCm, null)
})

test('layout: ray segments never leave the canvas, for every medium pair and angle', () => {
  const margin = 1e-6
  for (const mode of ['interface', 'slab']) for (let first = 0; first < 7; first++) for (let second = 0; second < 7; second++) for (let angle = 0; angle <= 89; angle += 4.5) {
    const model = buildSimulatorModel(scene({ firstMedium: first, secondMedium: second, incidentAngle: angle, mode }))
    for (const { x1, y1, x2, y2 } of model.segments) {
      for (const [x, y] of [[x1, y1], [x2, y2]]) assert.ok(Number.isFinite(x) && Number.isFinite(y) && y >= -margin && y <= CANVAS.height + margin, `${mode} ${first}→${second} ${angle}°`)
    }
  }
})

test('layout: under total internal reflection only incident and reflected rays are drawn, the latter at full weight', () => {
  const model = buildSimulatorModel(scene({ firstMedium: idx('water'), secondMedium: idx('air'), incidentAngle: 70 }))
  assert.equal(model.segments.length, 2)
  assert.equal(model.segments[1].weight, 1)
})

test('layout: the slab exit ray is parallel to the incident ray', () => {
  const { segments } = buildSimulatorModel(scene({ firstMedium: idx('air'), secondMedium: idx('glass'), incidentAngle: 50, mode: 'slab' }))
  const [incident, , , exit] = segments
  const slope = (s) => (s.y2 - s.y1) / (s.x2 - s.x1)
  near(Math.abs(slope(exit)), Math.abs(slope(incident)), 1e-9)
  assert.equal(exit.isExit, true)
})

test('every preset produces a valid scene; the critical-angle preset sits just below the critical angle', () => {
  for (const preset of SCENARIOS) {
    const changes = preset.apply(DEFAULT_SCENE), next = { ...DEFAULT_SCENE, ...changes }
    assert.ok(next.incidentAngle >= 0 && next.incidentAngle <= 89, preset.id)
    assert.ok(next.firstMedium >= 0 && next.secondMedium >= 0, preset.id)
    assert.ok(Number.isFinite(buildSimulatorModel(next).n1), preset.id)
  }
  const critical = SCENARIOS.find((preset) => preset.id === 'critical-angle'), next = { ...DEFAULT_SCENE, ...critical.apply(DEFAULT_SCENE) }
  const model = buildSimulatorModel(next)
  assert.equal(model.totalInternalReflection, false, 'the ray must still exit')
  assert.ok(model.criticalDegrees - next.incidentAngle < 0.5 + 1e-9)
})

test('explanation text covers the four situations', () => {
  const titles = new Set([
    explainScene(scene(), buildSimulatorModel(scene())).title,
    explainScene(scene({ firstMedium: idx('water'), secondMedium: idx('air'), incidentAngle: 30 }), buildSimulatorModel(scene({ firstMedium: idx('water'), secondMedium: idx('air'), incidentAngle: 30 }))).title,
    explainScene(scene({ firstMedium: idx('water'), secondMedium: idx('air'), incidentAngle: 70 }), buildSimulatorModel(scene({ firstMedium: idx('water'), secondMedium: idx('air'), incidentAngle: 70 }))).title,
    explainScene(scene({ secondMedium: idx('air') }), buildSimulatorModel(scene({ secondMedium: idx('air') }))).title,
  ])
  assert.equal(titles.size, 4)
})
