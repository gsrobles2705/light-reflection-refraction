import { buildPrismGeometry, PRISM_LAB } from '../../domain/prism.js'
import { pointInPolygon } from '../../domain/rayTracing.js'
import { clamp } from '../../domain/numbers.js'
import { toDegrees } from '../../domain/units.js'
import { aimHandlePosition } from '../../rendering/prismLabRenderer.js'

const { height: HEIGHT, laserX: LASER_X } = PRISM_LAB
/** Distance (logical px) within which a pointer grabs the laser or the aiming ring. */
const GRAB_RADIUS = 40
const MAX_AIM_ANGLE = 35
const LASER_Y_MARGIN = 30
const MIN_AIM_DISTANCE = 40
const roundToHalf = (value) => Math.round(value * 2) / 2

/** What the pointer grabbed at `point` (laser body, aiming ring or the prism), or `null`. */
export function findHandleAt(point, settings) {
  const [aimX, aimY] = aimHandlePosition(settings)
  if (Math.hypot(point[0] - LASER_X, point[1] - settings.laserY) < GRAB_RADIUS) return { kind: 'laser' }
  if (Math.hypot(point[0] - aimX, point[1] - aimY) < GRAB_RADIUS) return { kind: 'aim' }
  if (!settings.prismHidden) {
    const { center, polygons } = buildPrismGeometry(settings)
    if (pointInPolygon(point, polygons[0])) return { kind: 'rotate', startAngle: Math.atan2(point[1] - center[1], point[0] - center[0]), startRotation: settings.rotation }
  }
  return null
}

/** Settings changes produced by dragging a grabbed handle to `point`. */
export function settingsPatchForDrag(drag, point, settings) {
  if (drag.kind === 'laser') return { laserY: Math.round(clamp(point[1], LASER_Y_MARGIN, HEIGHT - LASER_Y_MARGIN)) }
  if (drag.kind === 'aim') return { laserAngle: roundToHalf(clamp(toDegrees(Math.atan2(point[1] - settings.laserY, Math.max(MIN_AIM_DISTANCE, point[0] - LASER_X))), -MAX_AIM_ANGLE, MAX_AIM_ANGLE)) }
  const { center } = buildPrismGeometry(settings)
  const sweptAngle = Math.atan2(point[1] - center[1], point[0] - center[0]) - drag.startAngle
  return { rotation: (Math.round((drag.startRotation + toDegrees(sweptAngle)) * 2) / 2) % 360 }
}
