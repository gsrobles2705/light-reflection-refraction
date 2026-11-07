// Laser and beam drawing shared by the prism lab and the simulator (canvas versions). The SVG equivalents live in
// components/LaserSvg.jsx and draw exactly the same shapes: if you change the look here, change it there too.

/**
 * Beam: color glow + white core + wavefronts that advance (slower where n is higher).
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x1 beam start
 * @param {number} y1
 * @param {number} x2 beam end
 * @param {number} y2
 * @param {object} options
 * @param {string} options.color        glow color
 * @param {number} [options.intensity]  beam energy in 0–1; controls thickness and brightness
 * @param {number} [options.mediumIndex] refractive index of the medium; wavefront speed ∝ 1/n
 * @param {number} [options.time]       seconds, animates the wavefronts
 * @param {boolean} [options.wavefronts] draw the moving wavefront ticks
 * @param {string} [options.core]       color of the bright core
 * @param {'all'|'static'|'moving'} [options.part] 'static' = glow + core only, 'moving' = wavefronts only (lets callers
 *        cache the static part in an offscreen layer and redraw just the wavefronts each frame)
 */
export function drawBeam(ctx, x1, y1, x2, y2, { color, intensity = 1, mediumIndex = 1, time = 0, wavefronts = true, core = '#fff', part = 'all' } = {}) {
  const length = Math.hypot(x2 - x1, y2 - y1)
  if (length < 1) return
  const ux = (x2 - x1) / length, uy = (y2 - y1) / length, strength = Math.max(0.04, intensity)
  const baseAlpha = ctx.globalAlpha   // respect an alpha already set by the caller (cross-fades between modes)
  ctx.save()
  ctx.lineCap = 'round'
  if (part !== 'moving') {
    ctx.globalAlpha = baseAlpha * (0.18 + 0.6 * strength)
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5 + 4.5 * strength
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = 8 + 16 * strength
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    ctx.restore()
    ctx.globalAlpha = baseAlpha * (0.25 + 0.65 * strength)
    ctx.strokeStyle = core
    ctx.lineWidth = 0.8 + 1.8 * strength
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  }
  if (wavefronts && part !== 'static') {
    const spacing = 46 / mediumIndex, speed = 150 / mediumIndex, offset = (time * speed) % spacing, halfHeight = 9 * (0.5 + strength * 0.5)
    ctx.globalAlpha = baseAlpha * (0.5 + 0.5 * strength)
    ctx.fillStyle = '#fff'
    for (let along = offset; along < length; along += spacing) {
      ctx.save()
      ctx.translate(x1 + ux * along, y1 + uy * along)
      ctx.rotate(Math.atan2(uy, ux))
      ctx.fillRect(-1.5, -halfHeight, 3, halfHeight * 2)
      ctx.restore()
    }
  }
  ctx.restore()
}

/**
 * Laser body: metal casing, ring, button and a glowing lens. (x, y) is where the beam starts and `angle` its direction
 * in radians. Returns the current radius of the pulsing drag-handle ring.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} angle
 * @param {object} options
 * @param {string} options.color     lens and button color
 * @param {number} [options.scale]   enlarges the laser when the canvas is displayed smaller than its logical size
 * @param {number} [options.time]    seconds, animates the handle ring
 * @param {boolean} [options.handle] draw the pulsing ring that signals "drag me"
 */
export function drawLaser(ctx, x, y, angle, { color, scale = 1, time = 0, handle = true } = {}) {
  drawLaserBody(ctx, x, y, angle, { color, scale })
  return handle ? drawLaserHandle(ctx, x, y, { color, scale, time }) : laserPulse(scale, time)
}

const laserPulse = (scale, time) => (14 + Math.sin(time * 4) * 2.5) * Math.min(scale, 1.7)

/** Pulsing "drag me" ring around the laser; returns its current radius. Cheap: safe to redraw every frame. */
export function drawLaserHandle(ctx, x, y, { color, scale = 1, time = 0 } = {}) {
  const pulse = laserPulse(scale, time)
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(x, y, pulse, 0, 7); ctx.stroke()
  ctx.restore()
  return pulse
}

/** Laser casing, ring, button and glowing lens (static: shadows make it expensive to redraw every frame). */
export function drawLaserBody(ctx, x, y, angle, { color, scale = 1 } = {}) {
  const bodyScale = Math.min(scale, 1.6)
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  const body = ctx.createLinearGradient(0, -10 * bodyScale, 0, 10 * bodyScale)
  body.addColorStop(0, '#7d8f98'); body.addColorStop(0.45, '#33444b'); body.addColorStop(1, '#10181c')
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3
  ctx.fillStyle = body
  ctx.beginPath(); ctx.roundRect(-58 * bodyScale, -10 * bodyScale, 58 * bodyScale, 20 * bodyScale, 5 * bodyScale); ctx.fill()
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
  ctx.fillStyle = '#9fb2bb'
  ctx.fillRect(-40 * bodyScale, -11 * bodyScale, 5 * bodyScale, 22 * bodyScale)
  ctx.fillRect(-30 * bodyScale, -11 * bodyScale, 3 * bodyScale, 22 * bodyScale)
  ctx.fillStyle = '#c9d6db'
  ctx.fillRect(-6 * bodyScale, -6 * bodyScale, 7 * bodyScale, 12 * bodyScale)
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(-18 * bodyScale, 0, 3.2 * bodyScale, 0, 7); ctx.fill()
  ctx.shadowColor = color; ctx.shadowBlur = 20; ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(2, 0, 3.6 * bodyScale, 0, 7); ctx.fill()
  ctx.restore()
}
