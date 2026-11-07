import { INDEX } from './media.js'
import { indexFromAngles, refractedAngleDegrees } from './optics.js'
import { parseDecimal, percentError } from './numbers.js'

/** Accepted difference (degrees) between the student's reading and the true refracted angle, in both modes. */
export const ANGLE_TOLERANCE_DEGREES = 1.5
/** Student readings below this angle are rejected as implausible. */
const MIN_READING_DEGREES = 2

export const TRAINING_ANGLES = { water: [20, 30, 45, 60, 70], mystery: [30, 40, 50, 60, 70] }

/** Picks one element; the random source is injectable so tests are deterministic. */
export const pickRandom = (items, random = Math.random) => items[Math.floor(random() * items.length)]

/** True refracted angle (degrees) when light goes from air into `material` at `incidentDegrees`. */
export const trueRefractedAngle = (incidentDegrees, material) => refractedAngleDegrees(INDEX.air, material.index, incidentDegrees)

/**
 * Validates and interprets what the student typed.
 * Returns `{ reading, measuredIndex }`, with `null` fields while the input is not a usable angle.
 */
export function interpretReading(rawText, incidentDegrees) {
  const reading = parseDecimal(rawText)
  const usable = reading >= MIN_READING_DEGREES && reading < 90
  return { reading: usable ? reading : null, measuredIndex: usable ? indexFromAngles(incidentDegrees, reading) : null }
}

/** Grades a reading in the "water" mode. */
export function gradeReading({ incidentDegrees, reading, measuredIndex, material }) {
  const trueAngle = trueRefractedAngle(incidentDegrees, material)
  return {
    correct: Math.abs(reading - trueAngle) <= ANGLE_TOLERANCE_DEGREES,
    trueAngle,
    errorPercent: percentError(measuredIndex, material.index),
  }
}

/**
 * Grades the guess in the "mystery material" mode. The measurement is validated first, with the same angle tolerance
 * as the water mode (an index-based tolerance would reject honest readings of high-index materials at small angles,
 * where a 1° reading error already changes n by about 9 %).
 */
export function gradeMysteryChoice({ incidentDegrees, reading, measuredIndex, secret, chosen }) {
  const measurementIsClose = Math.abs(reading - trueRefractedAngle(incidentDegrees, secret)) <= ANGLE_TOLERANCE_DEGREES
  return { measurementIsClose, correct: measurementIsClose && chosen.id === secret.id, errorPercent: percentError(measuredIndex, secret.index) }
}
