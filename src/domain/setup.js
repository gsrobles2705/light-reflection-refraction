import { INDEX } from './media.js'
import { refractedAngleDegrees } from './optics.js'

// The group's real setup: a 2 L transparent container, 1.8 to 2 L of water, 3 to 6 mL of milk and a red laser.

export const CONTAINER_LITERS = 2
export const WATER_LITERS = { min: 1.8, max: 2, step: 0.05, initial: 1.9 }
/** Milk the student can try; 3 to 6 mL is the range that works. */
export const MILK_ML = { min: 0, max: 8, step: 0.5, ideal: [3, 6], initial: 4.5 }
export const LASER_ANGLE = { min: 10, max: 80, step: 1, initial: 45 }

const clamp = (value, low, high) => Math.min(high, Math.max(low, value))

/** Fraction of the container height filled by `liters` of water. */
export const levelFraction = (liters) => clamp(liters/CONTAINER_LITERS, 0, 1)

/** 'faint' (too little milk), 'ideal' (3 to 6 mL) or 'cloudy' (too much milk). */
export const beamState = (milkMl) => (milkMl < MILK_ML.ideal[0] ? 'faint' : milkMl > MILK_ML.ideal[1] ? 'cloudy' : 'ideal')

/**
 * How the beam looks inside the water, each value from 0 to 1: the milk droplets scatter the light sideways, so the beam
 * becomes visible (`core`, `halo`); with too much milk the water turns cloudy and the beam dies out sooner (`reach`).
 */
export function beamLook(milkMl) {
  const seen = clamp(milkMl/MILK_ML.ideal[0], 0, 1)
  const turbid = clamp((milkMl - MILK_ML.ideal[1])/(MILK_ML.max - MILK_ML.ideal[1]), 0, 1)
  return {
    core: 0.12 + 0.88*seen*(1 - 0.35*turbid),
    halo: 0.1 + 0.3*clamp(milkMl/MILK_ML.ideal[1], 0, 1) + 0.25*turbid,
    reach: 1 - 0.55*turbid,
    tint: 0.04 + 0.3*clamp(milkMl/MILK_ML.max, 0, 1),
  }
}

/** Fraction (0 to 1) of unpolarized light reflected at the boundary between two media (Fresnel equations). */
export function reflectedFraction(n1, n2, incidentDegrees) {
  const incident = incidentDegrees*Math.PI/180, sinTransmitted = (n1/n2)*Math.sin(incident)
  if (sinTransmitted >= 1) return 1
  const cosI = Math.cos(incident), cosT = Math.sqrt(1 - sinTransmitted**2)
  const rs = ((n1*cosI - n2*cosT)/(n1*cosI + n2*cosT))**2, rp = ((n1*cosT - n2*cosI)/(n1*cosT + n2*cosI))**2
  return (rs + rp)/2
}

/** Everything the lab shows for one combination of water, milk and laser angle (air → water). */
export function setupReadout({ waterLiters, milkMl, incidentDegrees }) {
  const refractedDegrees = refractedAngleDegrees(INDEX.air, INDEX.water, incidentDegrees)
  return {
    level: levelFraction(waterLiters),
    refractedDegrees,
    reflectedDegrees: incidentDegrees,
    reflectedPercent: 100*reflectedFraction(INDEX.air, INDEX.water, incidentDegrees),
    state: beamState(milkMl),
    look: beamLook(milkMl),
  }
}
