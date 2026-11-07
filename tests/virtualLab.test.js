import assert from 'node:assert/strict'
import { test } from 'node:test'
import { INDEX, MEDIA } from '../src/domain/media.js'
import { ANGLE_TOLERANCE_DEGREES, gradeMysteryChoice, gradeReading, interpretReading, pickRandom, TRAINING_ANGLES, trueRefractedAngle } from '../src/domain/virtualLab.js'

const near = (actual, expected, tolerance = 0.01) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`)
const material = (id) => MEDIA.find((medium) => medium.id === id)
const MYSTERY = ['water', 'glass', 'diamond'].map(material)

test('readings: validation and derived index', () => {
  assert.deepEqual(interpretReading('', 40), { reading: null, measuredIndex: null })
  assert.deepEqual(interpretReading('1', 40), { reading: null, measuredIndex: null }, 'below the plausible range')
  assert.deepEqual(interpretReading('90', 40), { reading: null, measuredIndex: null })
  assert.deepEqual(interpretReading('abc', 40), { reading: null, measuredIndex: null })
  const { reading, measuredIndex } = interpretReading('28,8', 40)
  assert.equal(reading, 28.8)
  near(measuredIndex, 1.333, 0.002)
})

test('water mode grades with the documented tolerance', () => {
  const water = material('water'), trueAngle = trueRefractedAngle(40, water)
  const grade = (reading) => gradeReading({ incidentDegrees: 40, reading, measuredIndex: interpretReading(String(reading), 40).measuredIndex, material: water })
  assert.equal(grade(trueAngle).correct, true)
  assert.equal(grade(trueAngle + ANGLE_TOLERANCE_DEGREES - 0.01).correct, true)
  assert.equal(grade(trueAngle + ANGLE_TOLERANCE_DEGREES + 0.2).correct, false)
})

// Water (1.33) and glass (1.52) are the closest pair: beyond ~1° of reading error they can be confused at small angles.
// That is inherent to measuring, so the "closest by n" guarantee is only asserted for the usual ±1° reading error.
test('mystery mode: honest readings are accepted, and with ±1° of error the secret is still the closest material by n', () => {
  for (const secret of MYSTERY) for (const incident of TRAINING_ANGLES.mystery) {
    const truth = trueRefractedAngle(incident, secret)
    for (const error of [-1.4, -1, 0, 1, 1.4]) {
      const { reading, measuredIndex } = interpretReading(String(truth + error), incident)
      assert.equal(gradeMysteryChoice({ incidentDegrees: incident, reading, measuredIndex, secret, chosen: secret }).correct, true, `${secret.id} at ${incident}° with ${error}° error`)
      if (Math.abs(error) > 1) continue
      const closest = [...MYSTERY].sort((a, b) => Math.abs(measuredIndex - a.index) - Math.abs(measuredIndex - b.index))[0]
      assert.equal(closest.id, secret.id, `${secret.id} at ${incident}° with ${error}° error is mistaken for ${closest.id}`)
    }
  }
})

test('mystery mode rejects a wrong measurement even if the guess is right', () => {
  const secret = material('glass'), incident = 40, truth = trueRefractedAngle(incident, secret)
  const grade = (reading, chosen) => gradeMysteryChoice({ incidentDegrees: incident, reading, measuredIndex: interpretReading(String(reading), incident).measuredIndex, secret, chosen })
  assert.equal(grade(truth + 5, secret).correct, false)
  assert.equal(grade(truth, secret).correct, true)
  assert.equal(grade(truth, material('water')).correct, false)
})

test('pickRandom uses the injected random source', () => {
  assert.equal(pickRandom(['a', 'b', 'c'], () => 0), 'a')
  assert.equal(pickRandom(['a', 'b', 'c'], () => 0.999), 'c')
  assert.equal(INDEX.air, 1)
})
