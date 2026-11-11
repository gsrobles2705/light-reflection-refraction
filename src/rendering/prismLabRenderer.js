import { PRISM_LAB, WHITE_LIGHT_WAVELENGTHS, traceWavelength } from '../domain/prism.js'
import { wavelengthToCss, wavelengthToRgb } from '../domain/spectrum.js'
import { toRadians } from '../domain/units.js'
import { drawBeam, drawLaser, drawLaserBody, drawLaserHandle } from './laser.js'

const { width: W, height: H, screenX: SCREEN_X, laserX: LASER_X } = PRISM_LAB
/** Distance from the laser to the aiming ring, in logical pixels. */
const AIM_HANDLE_DISTANCE = 140
const FAR_AWAY = 900
/** Dense sampling (every 4 nm) used to paint the dispersed light as a continuous band instead of separate lines. */
const FAN_WAVELENGTHS = Array.from({ length: 76 }, (_, i) => 400 + i*4)
/** Below this spread (px) on the screen the colors have recombined into white, so no band is painted. */
const MIN_FAN_SPREAD = 12

/** Position of the white ring used to aim the laser. */
export const aimHandlePosition = (settings) => {
  const angle = toRadians(settings.laserAngle)
  return [LASER_X + Math.cos(angle) * AIM_HANDLE_DISTANCE, settings.laserY + Math.sin(angle) * AIM_HANDLE_DISTANCE]
}

function drawScreen(ctx) {
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#05060f'; ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 6
  ctx.beginPath(); ctx.moveTo(SCREEN_X, 20); ctx.lineTo(SCREEN_X, H - 20); ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'right'
  ctx.fillText('pantalla', SCREEN_X - 12, 34)
}

/** Soft radial glow of one color at (x, y); drawn additively so overlapping glows add up like light. */
function drawGlow(ctx, x, y, radius, rgb, alpha) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius)
  glow.addColorStop(0, `rgba(${rgb.join(',')},${alpha})`); glow.addColorStop(0.35, `rgba(${rgb.join(',')},${alpha*0.35})`); glow.addColorStop(1, `rgba(${rgb.join(',')},0)`)
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = glow
  ctx.beginPath(); ctx.arc(x, y, radius, 0, 7); ctx.fill(); ctx.restore()
}

/**
 * Glass prism drawn like a thick crystal: a soft reflection on the floor, a back face for depth, a bluish beveled rim
 * (outer and inner triangle joined at the corners), a nearly clear core, a glowing border and a specular streak.
 */
function drawPrismBody(ctx, vertices, opacity) {
  ctx.save(); ctx.globalAlpha = opacity
  const xs = vertices.map((v) => v[0]), ys = vertices.map((v) => v[1]), centerX = (xs[0] + xs[1] + xs[2]) / 3, centerY = (ys[0] + ys[1] + ys[2]) / 3
  const inset = (v, factor) => [centerX + (v[0] - centerX)*factor, centerY + (v[1] - centerY)*factor]
  const tracePath = (points) => { ctx.beginPath(); points.forEach((v, i) => (i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]))); ctx.closePath() }
  const inner = vertices.map((v) => inset(v, 0.8)), back = vertices.map((v) => [v[0] + 16, v[1] - 11])

  // reflection on the floor under the prism
  const width = Math.max(...xs) - Math.min(...xs), floorY = Math.max(...ys) + 18
  ctx.save(); ctx.translate(centerX + 6, floorY); ctx.scale(1, 0.14)
  const floor = ctx.createRadialGradient(0, 0, 0, 0, 0, width*0.75)
  floor.addColorStop(0, 'rgba(140,175,255,.28)'); floor.addColorStop(1, 'rgba(140,175,255,0)')
  ctx.fillStyle = floor; ctx.beginPath(); ctx.arc(0, 0, width*0.75, 0, 7); ctx.fill(); ctx.restore()

  // back face and the edges that join it to the front
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(150,185,255,.3)'; tracePath(back); ctx.stroke()
  vertices.forEach((v, i) => { ctx.beginPath(); ctx.moveTo(v[0], v[1]); ctx.lineTo(back[i][0], back[i][1]); ctx.stroke() })

  // beveled rim: the ring between the outer and the inner triangle, lit from the top left
  const rim = ctx.createLinearGradient(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys))
  rim.addColorStop(0, 'rgba(170,205,255,.5)'); rim.addColorStop(0.5, 'rgba(70,105,200,.3)'); rim.addColorStop(1, 'rgba(150,190,255,.42)')
  ctx.fillStyle = rim; ctx.beginPath()
  ;[vertices, inner].forEach((points) => { points.forEach((v, i) => (i ? ctx.lineTo(v[0], v[1]) : ctx.moveTo(v[0], v[1]))); ctx.closePath() })
  ctx.fill('evenodd')   // outer triangle minus inner triangle = the rim only, so the core stays clear
  // a very light tint on the core so the beam inside stays easy to see
  const core = ctx.createLinearGradient(inner[1][0], inner[0][1], inner[2][0], inner[1][1])
  core.addColorStop(0, 'rgba(200,225,255,.1)'); core.addColorStop(1, 'rgba(120,160,235,.04)')
  ctx.fillStyle = core; tracePath(inner); ctx.fill()

  // bevel lines: inner triangle and the corner joints
  ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(225,238,255,.5)'; tracePath(inner); ctx.stroke()
  vertices.forEach((v, i) => { ctx.beginPath(); ctx.moveTo(v[0], v[1]); ctx.lineTo(inner[i][0], inner[i][1]); ctx.stroke() })
  // glowing border
  ctx.save(); ctx.shadowColor = 'rgba(150,190,255,.75)'; ctx.shadowBlur = 16; tracePath(vertices); ctx.strokeStyle = 'rgba(215,232,255,.9)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore()
  // specular streak along the left face
  const [apex, left] = vertices
  ctx.beginPath(); ctx.moveTo(apex[0] + (left[0] - apex[0]) * 0.16, apex[1] + (left[1] - apex[1]) * 0.16); ctx.lineTo(apex[0] + (left[0] - apex[0]) * 0.5, apex[1] + (left[1] - apex[1]) * 0.5)
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke()
  ctx.restore()
}

/**
 * How much wider than the traced spread the rainbow is drawn on the way out. The simplified model keeps real colors
 * in the right order and direction, but the real spread of glass is too thin to see; this makes it easy to read.
 */
const FAN_GAIN = 2.4

/** Traced rays of white light (one per sampled wavelength) with the point where each one lands on the screen. */
function traceFan(settings, geometry) {
  const rays = FAN_WAVELENGTHS.map((nm) => {
    const { points, direction } = traceWavelength({ ...settings, whiteLight: true }, nm, geometry)
    const from = points[points.length - 1]
    return direction[0] > 0.02 ? { nm, points, from, to: [SCREEN_X, from[1] + direction[1]*((SCREEN_X - from[0])/direction[0])] } : null
  })
  const landed = rays.filter(Boolean)
  if (landed.length < rays.length*0.8) return null
  const ys = landed.map((ray) => ray.to[1]), top = Math.min(...ys), bottom = Math.max(...ys)
  if (bottom - top < MIN_FAN_SPREAD) return null
  const middle = (top + bottom)/2
  return { rays, landed, top, bottom, middle, widen: (point, scale = 1) => [point[0], middle + (point[1] - middle)*FAN_GAIN*scale] }
}

/** Dark plate with a colored dot and white text, centered on (x, y); keeps labels readable on top of the rainbow. */
function drawTag(ctx, text, x, y, rgb, align) {
  ctx.font = '600 12.5px sans-serif'
  const width = ctx.measureText(text).width + 34, height = 26, left = align === 'right' ? x - width : x
  ctx.save()
  ctx.fillStyle = 'rgba(5,6,15,.9)'; ctx.strokeStyle = `rgba(${rgb.join(',')},.95)`; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.roundRect(left, y - height/2, width, height, height/2); ctx.fill(); ctx.stroke()
  ctx.fillStyle = `rgb(${rgb.join(',')})`; ctx.beginPath(); ctx.arc(left + 15, y, 4.5, 0, 7); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(text, left + 26, y + 4.3)
  ctx.restore()
  return { left, width, height }
}

/**
 * Dispersed light as a continuous, glowing rainbow: a gradient wedge between every pair of neighbouring wavelengths.
 * The wedge starts where the beam enters the glass (the colors already part a little inside it), widens at every face
 * and is brightest on the screen, where a solid spectrum strip is also painted. Glows mark where the light enters and
 * leaves the glass. Two tags say which end bends the most; they sit clear of the band, joined to it by a thin line.
 * Returns the fan (so the caller can place the highlighted color inside it) or null, and draws nothing, when the
 * colors barely separate.
 */
function drawSpectrumFan(ctx, settings, geometry) {
  const fan = traceFan(settings, geometry)
  if (!fan) return null
  const { rays, landed, top, bottom, widen } = fan
  const rgbaOf = (nm, alpha) => `rgba(${wavelengthToRgb(nm).join(',')},${alpha})`
  const fillQuad = (corners, nm, alpha0, alpha1, gain = 1) => {
    const gradient = ctx.createLinearGradient(corners[0][0], corners[0][1], corners[1][0], corners[1][1])
    gradient.addColorStop(0, rgbaOf(nm, alpha0*gain)); gradient.addColorStop(1, rgbaOf(nm, alpha1*gain))
    ctx.fillStyle = gradient
    ctx.beginPath(); corners.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill()
  }
  ctx.save()
  // Light adds up: neighbouring colors are blended with 'lighter'. Wider, fainter copies of the band act as a soft halo.
  ctx.globalCompositeOperation = 'lighter'
  const passes = [{ scale: 1.5, gain: 0.16 }, { scale: 1.22, gain: 0.26 }, { scale: 1, gain: 1.15, inside: true }]
  for (const pass of passes) {
    for (let i = 0; i < rays.length - 1; i++) {
      const a = rays[i], b = rays[i + 1]
      if (!a || !b) continue
      const mid = (a.nm + b.nm)/2, weight = 0.6 + 0.4*Math.min(1, Math.min(i, rays.length - 2 - i)/(rays.length*0.22))
      // inside the glass (and between two prisms): the colors have only just started to part
      if (pass.inside && a.points.length === b.points.length) for (let k = 1; k < a.points.length - 1; k++) fillQuad([a.points[k], a.points[k + 1], b.points[k + 1], b.points[k]], mid, 0.4*weight, 0.8*weight)
      fillQuad([a.from, widen(a.to, pass.scale), widen(b.to, pass.scale), b.from], mid, 0.16*weight, 0.9*weight, pass.gain)
    }
  }
  // glows where the light enters the glass, in the middle of the fan, and where it leaves
  const exit = landed[Math.floor(landed.length/2)].from
  drawGlow(ctx, exit[0], exit[1], 30, [255, 255, 255], 0.5)
  ctx.globalCompositeOperation = 'source-over'
  // The spectrum strip where the light lands on the screen (slightly overlapped so no seams show)
  for (let i = 0; i < rays.length - 1; i++) {
    const a = rays[i], b = rays[i + 1]
    if (!a || !b) continue
    const aY = widen(a.to)[1], bY = widen(b.to)[1]
    ctx.fillStyle = rgbaOf((a.nm + b.nm)/2, 1)
    ctx.fillRect(SCREEN_X - 8, Math.min(aY, bY) - 0.4, 16, Math.abs(bY - aY) + 0.8)
  }
  // Which end bends the most. The tag sits on the free side of the band: the band edge is followed along the tag's
  // width so the tag never covers it, and a thin line joins the tag to the end of the strip.
  const violet = landed[0], red = landed[landed.length - 1], violetOnTop = violet.to[1] < red.to[1]
  const topEdge = widen([SCREEN_X, top], 1.5)[1], bottomEdge = widen([SCREEN_X, bottom], 1.5)[1]
  const edgeAt = (ray, x, scale) => { const end = widen(ray.to, scale); return ray.from[1] + (end[1] - ray.from[1])*((x - ray.from[0])/(SCREEN_X - ray.from[0])) }
  const topRay = landed.reduce((best, ray) => (ray.to[1] < best.to[1] ? ray : best)), bottomRay = landed.reduce((best, ray) => (ray.to[1] > best.to[1] ? ray : best))
  const TAG_RIGHT = SCREEN_X - 20, TAG_MARGIN = 16
  const place = (onTop, text) => {
    ctx.font = '600 12.5px sans-serif'
    const width = ctx.measureText(text).width + 34   // only used to find the span of the tag
    const x0 = TAG_RIGHT - width, edge = onTop ? Math.min(edgeAt(topRay, x0, 1.5), edgeAt(topRay, TAG_RIGHT, 1.5), topEdge) : Math.max(edgeAt(bottomRay, x0, 1.5), edgeAt(bottomRay, TAG_RIGHT, 1.5), bottomEdge)
    return Math.max(28, Math.min(H - 20, edge + (onTop ? -TAG_MARGIN - 13 : TAG_MARGIN + 13)))
  }
  const draw = (ray, onTop, text) => {
    const y = place(onTop, text), rgb = lightenRgb(wavelengthToRgb(ray.nm), 0.3)
    const tag = drawTag(ctx, text, TAG_RIGHT, y, rgb, 'right')
    const strip = widen(ray.to)[1]
    ctx.strokeStyle = `rgba(${rgb.join(',')},.8)`; ctx.lineWidth = 1.5; ctx.setLineDash([3, 3])
    ctx.beginPath(); ctx.moveTo(tag.left + tag.width - 18, y + (onTop ? tag.height/2 : -tag.height/2)); ctx.lineTo(SCREEN_X - 3, strip + (onTop ? -2 : 2)); ctx.stroke(); ctx.setLineDash([])
  }
  draw(violet, violetOnTop, 'violeta: se desvía más'); draw(red, !violetOnTop, 'rojo: se desvía menos')
  ctx.restore()
  return fan
}

/** Lightens an RGB triple toward white by `amount` (0–1). */
const lightenRgb = (rgb, amount) => rgb.map((v) => Math.round(v + (255 - v) * amount))
const lighten = (rgb, amount) => `rgb(${lightenRgb(rgb, amount)})`

/**
 * One light mode per pass (white light or a single color); when switching modes both passes are drawn with
 * complementary opacities so they cross-fade.
 */
function drawBeams(ctx, settings, geometry, selectedWavelength, whiteLight, opacity, time, part = 'all') {
  const doStatic = part !== 'moving'
  const wavelengths = whiteLight ? (doStatic ? WHITE_LIGHT_WAVELENGTHS : WHITE_LIGHT_WAVELENGTHS.slice(0, 1)) : [settings.wavelength]   // moving pass of white light: only the entry beam has wavefronts
  const traced = wavelengths.map((nm) => ({ nm, ...traceWavelength({ ...settings, whiteLight }, nm, geometry) }))
  ctx.save(); ctx.globalAlpha = opacity
  if (whiteLight) {
    const entry = traced[0].points[1] || [SCREEN_X, settings.laserY]
    drawBeam(ctx, LASER_X, settings.laserY, entry[0], entry[1], { color: '#fff', time, part, wavefronts: false })
    if (!doStatic) { ctx.restore(); return }
    ctx.save(); ctx.font = '600 12.5px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.8)'
    ctx.fillText('luz blanca', (LASER_X + entry[0]) / 2 + 20, (settings.laserY + entry[1]) / 2 - 16); ctx.restore()
  }
  const fanned = whiteLight ? drawSpectrumFan(ctx, settings, geometry) : null
  if (whiteLight && doStatic && traced[0].points[1]) drawGlow(ctx, traced[0].points[1][0], traced[0].points[1][1], 34, [255, 255, 255], 0.85)   // flare where the beam meets the glass
  ctx.globalCompositeOperation = 'lighter'
  // Per-channel normalization so the sum of all sampled colors adds up to white
  const channelTotals = [0, 0, 0]
  if (whiteLight) WHITE_LIGHT_WAVELENGTHS.forEach((nm) => wavelengthToRgb(nm).forEach((v, i) => (channelTotals[i] += v)))
  traced.forEach(({ nm, points, direction }) => {
    const rgb = wavelengthToRgb(nm).map((v, i) => (whiteLight ? Math.min(255, (v * 255 * 7) / Math.max(1, channelTotals[i])) : v))
    const visiblePoints = points.slice(whiteLight ? 1 : 0), last = points[points.length - 1]
    const landing = direction[0] > 0.02 ? [SCREEN_X, last[1] + direction[1] * ((SCREEN_X - last[0]) / direction[0])] : null
    const end = landing ? (fanned ? fanned.widen(landing) : landing) : [last[0] + direction[0] * FAR_AWAY, last[1] + direction[1] * FAR_AWAY]   // inside a fan the end follows the drawn rainbow
    const highlighted = nm === selectedWavelength || !whiteLight, color = `rgb(${rgb.map(Math.round)})`, path = [...visiblePoints, end]
    for (let i = 0; i < path.length - 1; i++) {
      if (fanned && !highlighted) continue   // the continuous band replaces the thin line of every color
      const options = whiteLight ? { color, core: lighten(rgb, 0.45), intensity: highlighted ? 0.55 : 0.3, wavefronts: false } : { color, wavefronts: false }
      drawBeam(ctx, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], { ...options, part })
    }
    if (doStatic && !(fanned && !highlighted) && direction[0] > 0.02 && end[1] > 0 && end[1] < H) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(SCREEN_X, end[1], nm === selectedWavelength ? 7 : 3.4, 0, 7); ctx.fill() }
  })
  ctx.restore()
}

/**
 * Draws one frame of the prism lab.
 *
 * @param {object} settings  display settings (already interpolated by the animation)
 * @param {object} geometry  result of buildPrismGeometry(...) for the prisms that should be drawn
 * @param {number} selectedWavelength  highlighted color (nm)
 * @param {{ prismOpacity:number, pairOpacity:number, whiteMix:number }} blend  cross-fade amounts in 0–1
 * @param {{ time:number, scale:number }} frame
 */
export function renderPrismLab(ctx, settings, geometry, selectedWavelength, blend, { time = 0, scale = 1 } = {}) {
  const tracedGeometry = { ...geometry, polygons: geometry.polygons.slice(0, settings.newtonPair ? 2 : 1) }   // the 2nd prism only bends light once visible
  drawScreen(ctx)
  if (blend.prismOpacity > 0.01) geometry.polygons.forEach((polygon, i) => drawPrismBody(ctx, polygon, blend.prismOpacity * (i ? blend.pairOpacity : 1)))
  if (blend.whiteMix > 0.01) drawBeams(ctx, settings, tracedGeometry, selectedWavelength, true, blend.whiteMix, time)
  if (blend.whiteMix < 0.99) drawBeams(ctx, settings, tracedGeometry, selectedWavelength, false, 1 - blend.whiteMix, time)
  ctx.globalCompositeOperation = 'source-over'
  const angle = toRadians(settings.laserAngle), [tipX, tipY] = aimHandlePosition(settings)
  drawLaser(ctx, LASER_X, settings.laserY, angle, { color: settings.whiteLight ? '#ffffff' : wavelengthToCss(settings.wavelength), scale, time })
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(tipX, tipY, 13, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill()
  if (blend.prismOpacity > 0.5) {
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '600 13px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('arrastra el prisma para girarlo', geometry.center[0], H - 14)
  }
}

/**
 * Same picture as `renderPrismLab`, with cached layers. Once the mode is settled (no white/single-color cross-fade in
 * progress) everything that only changes with the settings (screen, prisms, beam glow, laser casing, handles) is kept in
 * offscreen canvases, and each frame redraws only the wavefronts and the laser's pulsing ring. While the settings
 * change (dragging, easing) the layers are rebuilt every frame, which costs about the same as drawing directly.
 */
export function createPrismLabRenderer() {
  let layers = null, key = ''
  const makeLayer = (ratio) => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio)
    const context = canvas.getContext('2d')
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    return { canvas, ctx: context }
  }
  const beamPasses = (ctx, settings, tracedGeometry, selected, blend, time, part) => {
    if (blend.whiteMix > 0.01) drawBeams(ctx, settings, tracedGeometry, selected, true, blend.whiteMix, time, part)
    if (blend.whiteMix < 0.99) drawBeams(ctx, settings, tracedGeometry, selected, false, 1 - blend.whiteMix, time, part)
  }

  return function render(ctx, settings, geometry, selectedWavelength, blend, frame = {}) {
    const { time = 0, scale = 1 } = frame
    const transform = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null
    const settled = blend.whiteMix <= 0.01 || blend.whiteMix >= 0.99
    if (!transform || typeof document === 'undefined' || !settled) return renderPrismLab(ctx, settings, geometry, selectedWavelength, blend, frame)

    const ratio = transform.a, tracedGeometry = { ...geometry, polygons: geometry.polygons.slice(0, settings.newtonPair ? 2 : 1) }
    const color = settings.whiteLight ? '#ffffff' : wavelengthToCss(settings.wavelength)
    const nextKey = JSON.stringify([settings, selectedWavelength, blend, scale, ratio, geometry.polygons, geometry.center])
    if (!layers || layers.ratio !== ratio || nextKey !== key) {
      layers = layers && layers.ratio === ratio ? layers : { ratio, lower: makeLayer(ratio), upper: makeLayer(ratio) }
      key = nextKey
      const lower = layers.lower.ctx, upper = layers.upper.ctx
      lower.globalAlpha = 1; lower.globalCompositeOperation = 'source-over'
      drawScreen(lower)
      if (blend.prismOpacity > 0.01) geometry.polygons.forEach((polygon, i) => drawPrismBody(lower, polygon, blend.prismOpacity * (i ? blend.pairOpacity : 1)))
      beamPasses(lower, settings, tracedGeometry, selectedWavelength, blend, time, 'static')

      upper.clearRect(0, 0, W, H); upper.globalAlpha = 1; upper.globalCompositeOperation = 'source-over'
      drawLaserBody(upper, LASER_X, settings.laserY, toRadians(settings.laserAngle), { color, scale })
      const [tipX, tipY] = aimHandlePosition(settings)
      upper.strokeStyle = '#fff'; upper.lineWidth = 2.5; upper.beginPath(); upper.arc(tipX, tipY, 13, 0, 7); upper.stroke(); upper.fillStyle = 'rgba(255,255,255,.25)'; upper.fill()
      if (blend.prismOpacity > 0.5) {
        upper.fillStyle = 'rgba(255,255,255,.7)'; upper.font = '600 13px sans-serif'; upper.textAlign = 'center'
        upper.fillText('arrastra el prisma para girarlo', geometry.center[0], H - 14)
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(layers.lower.canvas, 0, 0, W, H)
    beamPasses(ctx, settings, tracedGeometry, selectedWavelength, blend, time, 'moving')
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(layers.upper.canvas, 0, 0, W, H)
    drawLaserHandle(ctx, LASER_X, settings.laserY, { color, scale, time })
  }
}
