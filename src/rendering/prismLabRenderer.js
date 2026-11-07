import { PRISM_LAB, WHITE_LIGHT_WAVELENGTHS, traceWavelength } from '../domain/prism.js'
import { wavelengthToCss, wavelengthToRgb } from '../domain/spectrum.js'
import { toRadians } from '../domain/units.js'
import { drawBeam, drawLaser, drawLaserBody, drawLaserHandle } from './laser.js'

const { width: W, height: H, screenX: SCREEN_X, laserX: LASER_X } = PRISM_LAB
/** Distance from the laser to the aiming ring, in logical pixels. */
const AIM_HANDLE_DISTANCE = 140
const FAR_AWAY = 900

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

/** Glass prism: back face and edges for depth, gradient body, inner bevel, glowing border and a specular streak. */
function drawPrismBody(ctx, vertices, opacity) {
  ctx.save(); ctx.globalAlpha = opacity
  const tracePath = (offset = [0, 0]) => {
    ctx.beginPath()
    vertices.forEach((v, i) => (i ? ctx.lineTo(v[0] + offset[0], v[1] + offset[1]) : ctx.moveTo(v[0] + offset[0], v[1] + offset[1])))
    ctx.closePath()
  }
  const xs = vertices.map((v) => v[0]), ys = vertices.map((v) => v[1]), centerX = (xs[0] + xs[1] + xs[2]) / 3, centerY = (ys[0] + ys[1] + ys[2]) / 3
  ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(190,215,255,.28)'; tracePath([16, -11]); ctx.stroke()
  vertices.forEach((v) => { ctx.beginPath(); ctx.moveTo(v[0], v[1]); ctx.lineTo(v[0] + 16, v[1] - 11); ctx.stroke() })
  const body = ctx.createLinearGradient(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys))
  body.addColorStop(0, 'rgba(185,215,255,.30)'); body.addColorStop(0.5, 'rgba(110,150,225,.07)'); body.addColorStop(1, 'rgba(210,230,255,.24)')
  tracePath(); ctx.fillStyle = body; ctx.fill()
  ctx.beginPath()
  vertices.forEach((v, i) => { const x = centerX + (v[0] - centerX) * 0.86, y = centerY + (v[1] - centerY) * 0.86; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) })
  ctx.closePath(); ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1.2; ctx.stroke()
  ctx.save(); ctx.shadowColor = 'rgba(150,190,255,.7)'; ctx.shadowBlur = 14; tracePath(); ctx.strokeStyle = 'rgba(205,225,255,.85)'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore()
  const [apex, left] = vertices
  ctx.beginPath(); ctx.moveTo(apex[0] + (left[0] - apex[0]) * 0.18, apex[1] + (left[1] - apex[1]) * 0.18); ctx.lineTo(apex[0] + (left[0] - apex[0]) * 0.55, apex[1] + (left[1] - apex[1]) * 0.55)
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke()
  ctx.restore()
}

/** Lightens an RGB triple toward white by `amount` (0–1). */
const lighten = (rgb, amount) => `rgb(${rgb.map((v) => Math.round(v + (255 - v) * amount))})`

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
    drawBeam(ctx, LASER_X, settings.laserY, entry[0], entry[1], { color: '#fff', time, part })
    if (!doStatic) { ctx.restore(); return }
  }
  ctx.globalCompositeOperation = 'lighter'
  // Per-channel normalization so the sum of all sampled colors adds up to white
  const channelTotals = [0, 0, 0]
  if (whiteLight) WHITE_LIGHT_WAVELENGTHS.forEach((nm) => wavelengthToRgb(nm).forEach((v, i) => (channelTotals[i] += v)))
  traced.forEach(({ nm, points, direction, index }) => {
    const rgb = wavelengthToRgb(nm).map((v, i) => (whiteLight ? Math.min(255, (v * 255 * 7) / Math.max(1, channelTotals[i])) : v))
    const visiblePoints = points.slice(whiteLight ? 1 : 0), last = points[points.length - 1]
    const end = direction[0] > 0.02 ? [SCREEN_X, last[1] + direction[1] * ((SCREEN_X - last[0]) / direction[0])] : [last[0] + direction[0] * FAR_AWAY, last[1] + direction[1] * FAR_AWAY]
    const highlighted = nm === selectedWavelength || !whiteLight, color = `rgb(${rgb.map(Math.round)})`, path = [...visiblePoints, end]
    for (let i = 0; i < path.length - 1; i++) {
      const insideGlass = (i + (whiteLight ? 1 : 0)) % 2 === 1   // odd segments are inside the glass (wavefronts move slower)
      const options = whiteLight ? { color, core: lighten(rgb, 0.45), intensity: highlighted ? 0.55 : 0.3, wavefronts: false } : { color, mediumIndex: insideGlass ? index : 1, time }
      drawBeam(ctx, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], { ...options, part })
    }
    if (doStatic && direction[0] > 0.02 && end[1] > 0 && end[1] < H) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(SCREEN_X, end[1], nm === selectedWavelength ? 7 : 3.4, 0, 7); ctx.fill() }
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
