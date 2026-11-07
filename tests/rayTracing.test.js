import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MAX_INTERACTIONS, pointInPolygon, traceThroughPolygons } from '../src/domain/rayTracing.js'

const near = (actual, expected, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`)
const SQUARE = [[0, 0], [100, 0], [100, 100], [0, 100]]   // a glass block with parallel faces

test('pointInPolygon', () => {
  assert.equal(pointInPolygon([50, 50], SQUARE), true)
  assert.equal(pointInPolygon([150, 50], SQUARE), false)
  assert.equal(pointInPolygon([-1, 50], SQUARE), false)
})

test('a ray at normal incidence crosses a block without bending', () => {
  const { points, direction, exitAngle } = traceThroughPolygons([SQUARE], 1.5, [-50, 50], [1, 0])
  assert.equal(points.length, 3)
  near(points[1][0], 0); near(points[2][0], 100)
  near(direction[0], 1); near(direction[1], 0, 1e-9)
  near(exitAngle, 0, 1e-6)
})

test('a tilted ray leaves a parallel-sided block parallel to its original direction', () => {
  const incident = [Math.cos(0.5), Math.sin(0.5)]
  const { direction } = traceThroughPolygons([SQUARE], 1.5, [-60, 20], incident)
  near(direction[0], incident[0], 1e-9); near(direction[1], incident[1], 1e-9)
})

test('a ray that misses the glass is not deflected', () => {
  const { points, direction } = traceThroughPolygons([SQUARE], 1.5, [-50, 300], [1, 0])
  assert.equal(points.length, 1)
  assert.deepEqual(direction, [1, 0])
})

test('tracing always terminates, even when light is trapped inside', () => {
  // very high index + grazing path: total internal reflection keeps the ray inside for several bounces
  const { points } = traceThroughPolygons([SQUARE], 5, [-20, 3], [Math.cos(0.9), Math.sin(0.9)])
  assert.ok(points.length <= MAX_INTERACTIONS + 1)
})
