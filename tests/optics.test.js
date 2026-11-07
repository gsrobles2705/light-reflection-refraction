import assert from 'node:assert/strict'
import { test } from 'node:test'
import { SPEED_OF_LIGHT } from '../src/domain/constants.js'
import { INDEX } from '../src/domain/media.js'
import { applySnellLaw, criticalAngleDegrees, effectiveIndex, indexFromAngles, reflectDirection, refractDirection, refractedAngleDegrees, slabLateralShift, speedInMedium } from '../src/domain/optics.js'
import { toDegrees, toRadians } from '../src/domain/units.js'

const near = (actual, expected, tolerance = 0.01) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`)

test("Snell's law: air → water", () => {
  near(refractedAngleDegrees(INDEX.air, INDEX.water, 40), 28.83)
  near(refractedAngleDegrees(INDEX.air, INDEX.water, 45), 32.04)
  near(refractedAngleDegrees(INDEX.air, INDEX.glass, 30), 19.2)
  near(refractedAngleDegrees(INDEX.air, INDEX.diamond, 50), 18.45)
})

test('normal incidence goes straight through; grazing incidence stays finite', () => {
  assert.equal(refractedAngleDegrees(1, 1.5, 0), 0)
  near(refractedAngleDegrees(1, 1.5, 89.99), 41.81, 0.05)
})

test('refraction is reversible', () => {
  const inside = refractedAngleDegrees(INDEX.air, INDEX.water, 35)
  near(refractedAngleDegrees(INDEX.water, INDEX.air, inside), 35, 1e-9)
})

test('critical angles', () => {
  near(criticalAngleDegrees(INDEX.water, INDEX.air), 48.61)
  near(criticalAngleDegrees(INDEX.glass, INDEX.air), 41.14)
  near(criticalAngleDegrees(INDEX.diamond, INDEX.air), 24.41)
  near(criticalAngleDegrees(INDEX.ice, INDEX.air), 49.76)
  assert.equal(criticalAngleDegrees(INDEX.air, INDEX.water), null, 'no critical angle when going to a denser medium')
})

test('total internal reflection starts exactly at the critical angle', () => {
  const critical = criticalAngleDegrees(INDEX.water, INDEX.air)
  assert.equal(applySnellLaw(INDEX.water, INDEX.air, toRadians(critical + 0.01)).totalInternalReflection, true)
  assert.equal(applySnellLaw(INDEX.water, INDEX.air, toRadians(critical - 0.01)).totalInternalReflection, false)
  assert.equal(refractedAngleDegrees(INDEX.water, INDEX.air, 70), null)
})

test('no NaN or Infinity anywhere in the 0–90° range', () => {
  for (const [n1, n2] of [[1, 1.333], [1.333, 1], [1.52, 2.42], [2.42, 1], [1, 1]]) {
    for (let angle = 0; angle <= 90; angle += 0.5) {
      const { refractedAngle } = applySnellLaw(n1, n2, toRadians(angle))
      assert.ok(Number.isFinite(refractedAngle), `${n1}→${n2} at ${angle}°`)
    }
  }
})

test('dispersion: the index grows as the wavelength shortens', () => {
  for (const base of [INDEX.water, INDEX.glass, INDEX.diamond]) {
    let previous = 0
    for (let nm = 700; nm >= 400; nm -= 25) {
      const index = effectiveIndex(base, nm, true)
      assert.ok(index > previous, `n(${nm} nm) must exceed n(${nm + 25} nm)`)
      previous = index
    }
    near(effectiveIndex(base, 550, true), base, 1e-12)   // the reference wavelength is unchanged
    assert.equal(effectiveIndex(base, 400, false), base)
  }
})

test('index from a pair of measured angles inverts Snell', () => {
  near(indexFromAngles(45, refractedAngleDegrees(1, INDEX.water, 45)), INDEX.water, 1e-9)
})

test('speed of light in glass is about 1.97×10⁸ m/s', () => {
  near(speedInMedium(INDEX.glass) / 1e8, 1.97)
  assert.equal(speedInMedium(1), SPEED_OF_LIGHT)
})

test('vector refraction agrees with the scalar law and reports total internal reflection', () => {
  const incident = toRadians(40), direction = [Math.sin(incident), -Math.cos(incident)], normal = [0, 1]   // ray going down onto a horizontal surface
  const refracted = refractDirection(direction, [0, 1], 1, INDEX.water)
  near(toDegrees(Math.atan2(Math.abs(refracted[0]), Math.abs(refracted[1]))), 28.83)
  assert.equal(refractDirection([Math.sin(toRadians(70)), -Math.cos(toRadians(70))], normal, INDEX.water, 1), null)
})

test('reflection preserves the angle', () => {
  const [x, y] = reflectDirection([0.6, -0.8], [0, 1])
  near(x, 0.6, 1e-12); near(y, 0.8, 1e-12)
})

test('slab: lateral shift of 55° through 6.5 cm of glass', () => {
  const incident = toRadians(55), refracted = applySnellLaw(1, INDEX.glass, incident).refractedAngle
  near(slabLateralShift(6.5, incident, refracted), 2.939, 0.002)
})
