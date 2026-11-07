import { reflectDirection, refractDirection } from './optics.js'
import { toDegrees } from './units.js'

/** Maximum number of surface interactions followed for a single ray. */
export const MAX_INTERACTIONS = 8
const EPSILON_PARALLEL = 1e-9
const EPSILON_DISTANCE = 1e-6

const centroid = (polygon) => [
  polygon.reduce((sum, vertex) => sum + vertex[0], 0) / polygon.length,
  polygon.reduce((sum, vertex) => sum + vertex[1], 0) / polygon.length,
]

/** Unit normal of the edge a→b, oriented away from the polygon interior. */
function outwardNormal(polygon, a, b) {
  const edgeX = b[0] - a[0], edgeY = b[1] - a[1], length = Math.hypot(edgeX, edgeY)
  let nx = edgeY / length, ny = -edgeX / length
  const [cx, cy] = centroid(polygon)
  if (nx * (cx - a[0]) + ny * (cy - a[1]) > 0) { nx = -nx; ny = -ny }
  return [nx, ny]
}

/** Nearest edge crossed by the ray, ignoring the edge it just left (`lastEdge`). */
function findNearestHit(polygons, origin, direction, lastEdge) {
  let best = null
  polygons.forEach((polygon, polygonIndex) => {
    polygon.forEach((a, edgeIndex) => {
      if (lastEdge && lastEdge[0] === polygonIndex && lastEdge[1] === edgeIndex) return
      const b = polygon[(edgeIndex + 1) % polygon.length]
      const edgeX = b[0] - a[0], edgeY = b[1] - a[1]
      const denominator = direction[0] * edgeY - direction[1] * edgeX
      if (Math.abs(denominator) < EPSILON_PARALLEL) return
      const distance = ((a[0] - origin[0]) * edgeY - (a[1] - origin[1]) * edgeX) / denominator
      const along = ((a[0] - origin[0]) * direction[1] - (a[1] - origin[1]) * direction[0]) / denominator
      if (distance > EPSILON_DISTANCE && along >= 0 && along <= 1 && (!best || distance < best.distance)) {
        best = { distance, edge: [polygonIndex, edgeIndex], normal: outwardNormal(polygon, a, b) }
      }
    })
  })
  return best
}

/**
 * Traces a ray through glass polygons (air outside, refractive index
 * `glassIndex` inside).
 *
 * Returns the path points, the final direction and the last exit angle in
 * degrees measured from the surface normal (`null` if the ray never leaves).
 */
export function traceThroughPolygons(polygons, glassIndex, origin, direction) {
  const points = [origin]
  let position = origin, heading = direction, lastEdge = null, exitAngle = null
  for (let step = 0; step < MAX_INTERACTIONS; step++) {
    const hit = findNearestHit(polygons, position, heading, lastEdge)
    if (!hit) break
    position = [position[0] + heading[0] * hit.distance, position[1] + heading[1] * hit.distance]
    points.push(position)
    lastEdge = hit.edge
    const [nx, ny] = hit.normal
    const leavingGlass = heading[0] * nx + heading[1] * ny > 0
    const facing = leavingGlass ? [-nx, -ny] : [nx, ny]   // normal pointing against the ray
    const refracted = leavingGlass ? refractDirection(heading, facing, glassIndex, 1) : refractDirection(heading, facing, 1, glassIndex)
    if (refracted) {
      if (leavingGlass) exitAngle = toDegrees(Math.acos(Math.min(1, -(refracted[0] * facing[0] + refracted[1] * facing[1]))))
      heading = refracted
    } else {
      heading = reflectDirection(heading, facing)   // total internal reflection: bounce inside
    }
  }
  return { points, direction: heading, exitAngle }
}

/** Even-odd rule point-in-polygon test. */
export function pointInPolygon(point, polygon) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const crosses = (polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])
    if (crosses && point[0] < ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1])) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]) inside = !inside
  }
  return inside
}
