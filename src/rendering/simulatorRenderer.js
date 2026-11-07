import { MEDIA } from '../domain/media.js'
import { toRadians } from '../domain/units.js'
import { CANVAS } from './simulatorModel.js'
import { drawBeam, drawLaser, drawLaserBody, drawLaserHandle } from './laser.js'

const { width: W, height: H, centerX: CX, slabHeight: SLAB } = CANVAS
const RAY_NAMES = ['luz que llega', 'rebota', 'se refracta', 'sale']
const NARROW_WEDGE = toRadians(16)

/** Text label on a translucent backing, so it never gets lost over a beam. */
function createLabeler(ctx, palette, scale) {
  return function drawTag(text, x, y, color, fontSize = 13, bold = true) {
    ctx.font = `${bold ? '700' : '500'} ${fontSize * scale}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const width = ctx.measureText(text).width + 10 * scale, height = fontSize * scale + 7 * scale
    ctx.globalAlpha = 0.85
    ctx.fillStyle = palette.bg
    ctx.fillRect(x - width / 2, y - height / 2, width, height)
    ctx.globalAlpha = 1
    ctx.fillStyle = color
    ctx.fillText(text, x, y)
  }
}

const mediumTint = (index) => Math.min(0.32, (index - 1) * 0.16)

function drawMedia(ctx, scene, model, palette, time) {
  drawMediaBase(ctx, scene, model, palette)
  drawRipples(ctx, scene, model, palette, time)
}

function drawMediaBase(ctx, scene, model, palette) {
  const { surfaceY, slabBottomY } = model, slab = scene.mode === 'slab'
  ctx.fillStyle = palette.bg; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = palette.b; ctx.globalAlpha = mediumTint(model.n1); ctx.fillRect(0, 0, W, H)
  ctx.globalAlpha = mediumTint(model.n2) + 0.05; ctx.fillStyle = palette.a; ctx.fillRect(0, surfaceY, W, slab ? SLAB : H - surfaceY); ctx.globalAlpha = 1
  // depth: lighter near the surface, darker below
  const bottom = slab ? slabBottomY : H, depth = ctx.createLinearGradient(0, surfaceY, 0, bottom)
  depth.addColorStop(0, 'rgba(255,255,255,.10)'); depth.addColorStop(1, 'rgba(0,0,0,.22)')
  ctx.fillStyle = depth; ctx.fillRect(0, surfaceY, W, bottom - surfaceY)
}

/** Gentle animated ripples: the only animated part of the background. */
function drawRipples(ctx, scene, model, palette, time) {
  const { surfaceY, slabBottomY } = model, slab = scene.mode === 'slab'
  ctx.strokeStyle = palette.a; ctx.globalAlpha = 0.12; ctx.lineWidth = 1
  for (let line = 0; line < 6; line++) {
    ctx.beginPath()
    for (let x = 0; x <= W; x += 12) {
      const y = surfaceY + 22 + line * 26 + Math.sin(x / 40 + time * 1.5 + line) * 3
      if (slab && y > slabBottomY) continue
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawSurfacesAndNormals(ctx, scene, model, palette) {
  const { surfaceY, slabBottomY } = model, slab = scene.mode === 'slab'
  ctx.strokeStyle = palette.mute; ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(0, surfaceY); ctx.lineTo(W, surfaceY)
  if (slab) { ctx.moveTo(0, slabBottomY); ctx.lineTo(W, slabBottomY) }
  ctx.stroke()
  // surface highlight
  ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, surfaceY + 2); ctx.lineTo(W, surfaceY + 2); ctx.stroke(); ctx.restore()
  // dashed normals (a second one where the ray leaves the slab)
  ctx.setLineDash([7, 7]); ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(CX, surfaceY - 200); ctx.lineTo(CX, surfaceY + (slab ? SLAB + 30 : 195)); ctx.stroke()
  const exit = model.segments.find((segment) => segment.isExit)
  if (exit) { ctx.beginPath(); ctx.moveTo(exit.x1, slabBottomY - 60); ctx.lineTo(exit.x1, slabBottomY + 60); ctx.stroke() }
  ctx.setLineDash([])
}

/** Protractor ticks; numeric labels are skipped where a ray would cross them. */
function drawProtractor(ctx, scene, model, palette, drawTag) {
  const { surfaceY } = model, slab = scene.mode === 'slab', angle = scene.incidentAngle
  const rayNear = (above, degrees) => (above ? Math.abs(degrees + angle) < 11 || Math.abs(degrees - angle) < 11 : !model.totalInternalReflection && Math.abs(degrees - model.refractedDegrees) < 11)
  for (const base of [-Math.PI / 2, Math.PI / 2]) {
    for (let degrees = -90; degrees <= 90; degrees += 5) {
      const theta = base + toRadians(degrees), outer = degrees % 10 === 0 ? 124 : 118
      ctx.globalAlpha = 0.55; ctx.strokeStyle = palette.mute; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(CX + Math.cos(theta) * 112, surfaceY + Math.sin(theta) * 112); ctx.lineTo(CX + Math.cos(theta) * outer, surfaceY + Math.sin(theta) * outer); ctx.stroke()
      ctx.globalAlpha = 1
      const labeled = degrees !== 0 && degrees % 30 === 0 && !rayNear(base < 0, degrees) && !(slab && base > 0)
      if (labeled) drawTag(Math.abs(degrees) + '°', CX + Math.cos(theta) * 142, surfaceY + Math.sin(theta) * 142, palette.mute, 11, false)
    }
  }
}

function drawCriticalAngle(ctx, model, palette, drawTag, scale) {
  const { surfaceY, criticalDegrees } = model, theta = -Math.PI / 2 - toRadians(criticalDegrees)
  ctx.setLineDash([3, 6]); ctx.strokeStyle = palette.err; ctx.lineWidth = 1.6
  ctx.beginPath(); ctx.moveTo(CX, surfaceY); ctx.lineTo(CX + Math.cos(theta) * 200, surfaceY + Math.sin(theta) * 200); ctx.stroke(); ctx.setLineDash([])
  drawTag('θc = ' + criticalDegrees.toFixed(1) + '°', CX + Math.cos(theta) * 178, surfaceY + Math.sin(theta) * 178 - 14 * scale, palette.err, 12)
}

function drawSlabGuide(ctx, scene, model, palette) {
  ctx.setLineDash([4, 6]); ctx.strokeStyle = palette.mute; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(CX, model.surfaceY); ctx.lineTo(CX + Math.tan(toRadians(scene.incidentAngle)) * (SLAB + 100), model.slabBottomY + 100); ctx.stroke(); ctx.setLineDash([])
}

function drawRayNames(model, palette, drawTag, scale) {
  drawTag('normal', CX + 34 * scale, model.surfaceY - 190, palette.mute, 12, false)
  model.segments.forEach((segment, i) => {
    const length = Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1)
    if (length < 90 || segment.weight < 0.04) return
    const ux = (segment.x2 - segment.x1) / length, uy = (segment.y2 - segment.y1) / length, side = i === 2 ? -1 : 1
    drawTag(RAY_NAMES[i], (segment.x1 + segment.x2) / 2 - uy * side * 30 * scale, (segment.y1 + segment.y2) / 2 + ux * side * 30 * scale, palette.ink, 12, false)
  })
}

/** Angle arc + label; in narrow wedges the label moves away from the rays. */
function drawAngleArc(ctx, drawTag, scale, { cx, cy, from, to, radius, color, label, side }) {
  ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, radius, from, to); ctx.stroke()
  const middle = (from + to) / 2, narrow = Math.abs(to - from) < NARROW_WEDGE
  const labelX = narrow ? cx + (side === -1 ? -1 : 1) * 58 * scale : cx + Math.cos(middle) * (radius + 34 * scale)
  const labelY = narrow ? cy + (side === 2 ? 98 : -98) : cy + Math.sin(middle) * (radius + 24 * scale)
  drawTag(label, labelX, labelY, color, 14)
}

function drawAngleArcs(ctx, scene, model, palette, drawTag, scale) {
  const { surfaceY, slabBottomY, refractedAngle, refractedDegrees } = model, incident = toRadians(scene.incidentAngle), degrees = scene.incidentAngle.toFixed(1)
  const arc = (options) => drawAngleArc(ctx, drawTag, scale, options)
  arc({ cx: CX, cy: surfaceY, from: -Math.PI / 2 - incident, to: -Math.PI / 2, radius: 62, color: palette.rayT, label: `θ₁ ${degrees}°`, side: -1 })
  arc({ cx: CX, cy: surfaceY, from: -Math.PI / 2, to: -Math.PI / 2 + incident, radius: 80, color: palette.at, label: `θ₁′ ${degrees}°`, side: 1 })
  if (!model.totalInternalReflection) arc({ cx: CX, cy: surfaceY, from: Math.PI / 2 - refractedAngle, to: Math.PI / 2, radius: 62, color: palette.bt, label: `θ₂ ${refractedDegrees.toFixed(1)}°`, side: 2 })
  const exit = model.segments.find((segment) => segment.isExit)
  if (exit) {
    arc({ cx: exit.x1, cy: slabBottomY, from: -Math.PI / 2 - refractedAngle, to: -Math.PI / 2, radius: 46, color: palette.bt, label: `${refractedDegrees.toFixed(1)}°`, side: -1 })
    arc({ cx: exit.x1, cy: slabBottomY, from: Math.PI / 2 - incident, to: Math.PI / 2, radius: 52, color: palette.rayT, label: `${degrees}°`, side: 2 })
  }
}

function drawMediumNames(scene, model, palette, drawTag, scale) {
  drawTag(`${MEDIA[scene.firstMedium].name} · n = ${model.n1.toFixed(3)}`, 16 * scale + 70 * scale, 20 * scale, palette.ink, 14)
  drawTag(`${MEDIA[scene.secondMedium].name} · n = ${model.n2.toFixed(3)}`, 16 * scale + 70 * scale, model.surfaceY + 22 * scale, palette.ink, 14)
  if (scene.mode === 'slab') drawTag(MEDIA[scene.firstMedium].name, 16 * scale + 30 * scale, model.slabBottomY + 22 * scale, palette.ink, 14)
}

/** Glow where the ray touches the surface. */
function drawImpactGlow(ctx, surfaceY, scale) {
  const radius = 44 * Math.min(scale, 1.5), glow = ctx.createRadialGradient(CX, surfaceY, 0, CX, surfaceY, radius)
  glow.addColorStop(0, 'rgba(255,255,255,.75)'); glow.addColorStop(0.4, 'rgba(255,255,255,.18)'); glow.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(CX, surfaceY, radius, 0, 7); ctx.fill()
}

/**
 * Draws one frame of the simulator.
 *
 * @param {CanvasRenderingContext2D} ctx   context in logical (900×460) coordinates
 * @param {object} scene                   user-controlled scene (see DEFAULT_SCENE)
 * @param {object} model                   result of buildSimulatorModel(scene)
 * @param {{ time:number, palette:object, rayColor:string, scale:number }} frame
 */
export function renderSimulator(ctx, scene, model, { time, palette, rayColor, scale }) {
  ctx.clearRect(0, 0, W, H)
  const drawTag = createLabeler(ctx, palette, scale)
  drawMedia(ctx, scene, model, palette, time)
  drawSurfacesAndNormals(ctx, scene, model, palette)
  if (scene.showProtractor) drawProtractor(ctx, scene, model, palette, drawTag)
  if (model.criticalDegrees && scene.showArcs) drawCriticalAngle(ctx, model, palette, drawTag, scale)
  if (scene.mode === 'slab' && !model.totalInternalReflection) drawSlabGuide(ctx, scene, model, palette)
  for (const segment of model.segments) drawBeam(ctx, segment.x1, segment.y1, segment.x2, segment.y2, { color: rayColor, intensity: segment.weight, mediumIndex: segment.index, time })
  ctx.globalAlpha = 1
  if (scene.showNames) drawRayNames(model, palette, drawTag, scale)
  if (scene.showArcs) drawAngleArcs(ctx, scene, model, palette, drawTag, scale)
  drawMediumNames(scene, model, palette, drawTag, scale)
  drawImpactGlow(ctx, model.surfaceY, scale)
  const incident = model.segments[0]
  const pulse = drawLaser(ctx, incident.x1, incident.y1, Math.atan2(incident.y2 - incident.y1, incident.x2 - incident.x1), { color: rayColor, scale, time })
  if (scene.showNames) drawTag('arrastra el láser', incident.x1, incident.y1 + (pulse + 16 * scale), palette.mute, 11, false)
  ctx.fillStyle = palette.ray; ctx.beginPath(); ctx.arc(CX, model.surfaceY, 6, 0, 7); ctx.fill()
}

/**
 * Same picture as `renderSimulator`, but the parts that only change when the scene, theme or size changes (background,
 * protractor, normals, labels, arcs, beam glow, laser casing) are painted once into offscreen layers. Each frame then
 * only blits the layers and redraws what really moves: ripples, beam wavefronts and the laser's pulsing ring.
 * Falls back to `renderSimulator` where offscreen canvases are unavailable (tests, very old browsers).
 */
export function createSimulatorRenderer() {
  let layers = null, key = []
  const makeLayer = (ratio) => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio)
    const context = canvas.getContext('2d')
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    return { canvas, ctx: context }
  }

  function build(scene, model, { palette, rayColor, scale }, ratio) {
    layers = layers && layers.ratio === ratio ? layers : { ratio, base: makeLayer(ratio), under: makeLayer(ratio), over: makeLayer(ratio) }
    for (const layer of [layers.base, layers.under, layers.over]) { layer.ctx.clearRect(0, 0, W, H); layer.ctx.globalAlpha = 1 }

    drawMediaBase(layers.base.ctx, scene, model, palette)

    const under = layers.under.ctx, tagUnder = createLabeler(under, palette, scale)
    drawSurfacesAndNormals(under, scene, model, palette)
    if (scene.showProtractor) drawProtractor(under, scene, model, palette, tagUnder)
    if (model.criticalDegrees && scene.showArcs) drawCriticalAngle(under, model, palette, tagUnder, scale)
    if (scene.mode === 'slab' && !model.totalInternalReflection) drawSlabGuide(under, scene, model, palette)
    for (const segment of model.segments) drawBeam(under, segment.x1, segment.y1, segment.x2, segment.y2, { color: rayColor, intensity: segment.weight, mediumIndex: segment.index, part: 'static' })
    under.globalAlpha = 1

    const over = layers.over.ctx, tagOver = createLabeler(over, palette, scale)
    if (scene.showNames) drawRayNames(model, palette, tagOver, scale)
    if (scene.showArcs) drawAngleArcs(over, scene, model, palette, tagOver, scale)
    drawMediumNames(scene, model, palette, tagOver, scale)
    drawImpactGlow(over, model.surfaceY, scale)
    const incident = model.segments[0]
    drawLaserBody(over, incident.x1, incident.y1, Math.atan2(incident.y2 - incident.y1, incident.x2 - incident.x1), { color: rayColor, scale })
  }

  return function render(ctx, scene, model, frame) {
    const { time, palette, rayColor, scale } = frame
    const transform = typeof ctx.getTransform === 'function' ? ctx.getTransform() : null
    if (!transform || typeof document === 'undefined') return renderSimulator(ctx, scene, model, frame)
    const ratio = transform.a, next = [scene, model, palette, rayColor, scale, ratio]
    if (!layers || next.some((value, i) => value !== key[i])) { build(scene, model, frame, ratio); key = next }

    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(layers.base.canvas, 0, 0, W, H)
    drawRipples(ctx, scene, model, palette, time)
    ctx.drawImage(layers.under.canvas, 0, 0, W, H)
    for (const segment of model.segments) drawBeam(ctx, segment.x1, segment.y1, segment.x2, segment.y2, { color: rayColor, intensity: segment.weight, mediumIndex: segment.index, time, part: 'moving' })
    ctx.globalAlpha = 1
    ctx.drawImage(layers.over.canvas, 0, 0, W, H)
    const incident = model.segments[0], pulse = drawLaserHandle(ctx, incident.x1, incident.y1, { color: rayColor, scale, time })
    if (scene.showNames) createLabeler(ctx, palette, scale)('arrastra el láser', incident.x1, incident.y1 + (pulse + 16 * scale), palette.mute, 11, false)
    ctx.fillStyle = palette.ray; ctx.beginPath(); ctx.arc(CX, model.surfaceY, 6, 0, 7); ctx.fill()
  }
}
