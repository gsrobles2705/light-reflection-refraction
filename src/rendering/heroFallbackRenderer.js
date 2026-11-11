const FAN_COLORS = ['#ff5d6c', '#ff9a4d', '#ffd34d', '#7be07a', '#3fe0d0', '#5a9bff', '#a37bff']
const FAN_RGB = FAN_COLORS.map((hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)))
/** The fan is painted as this many thin triangles, each one a blend between neighbouring colors, so no gaps show between colors. */
const FAN_SLICES = 28
const colorAt = (t) => {
  const position = t * (FAN_RGB.length - 1), i = Math.min(FAN_RGB.length - 2, Math.floor(position)), k = position - i
  return FAN_RGB[i].map((value, channel) => Math.round(value + (FAN_RGB[i + 1][channel] - value) * k))
}
const POINTER_SMOOTHING = 0.06
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/** Eases the pointer toward its target (purely decorative smoothing). */
export function advancePointer(pointer) {
  pointer.x += (pointer.targetX - pointer.x) * POINTER_SMOOTHING
  pointer.y += (pointer.targetY - pointer.y) * POINTER_SMOOTHING
}

/**
 * 2D fallback for browsers without WebGL: a flat prism with a white beam entering from the left and a continuous
 * spectrum wedge leaving it. The pointer rotates the prism and moves the entry point.
 *
 * @param {{ width:number, height:number }} size  canvas size in CSS pixels
 * @param {{ x:number, y:number }} pointer  smoothed pointer position in 0–1
 * @param {number} time  seconds-like phase driving the gentle wobble
 * @param {boolean} dark  dark theme (additive colors) or light theme (ink colors)
 */
export function drawHeroFallback(ctx, { width, height }, pointer, time, dark) {
  ctx.clearRect(0, 0, width, height)
  const wide = width > 900
  const centerX = wide ? width * 0.72 : width * 0.5, centerY = wide ? height * 0.52 : height * 0.8, radius = Math.min(width, height) * (wide ? 0.3 : 0.2)
  const rotation = (pointer.x - 0.5) * 0.6 + Math.sin(time) * 0.03
  const vertices = [0, 1, 2].map((i) => { const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 3 + rotation; return [centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius] })
  const entry = lerp(vertices[2], vertices[0], Math.min(0.8, Math.max(0.2, 0.5 + (pointer.y - 0.5) * 0.7))), exit = lerp(vertices[0], vertices[1], 0.5)
  const ink = dark ? '255,255,255' : '18,20,46'

  ctx.globalCompositeOperation = 'source-over'
  // incoming beam: almost invisible behind the text, bright where it reaches the prism
  const beam = ctx.createLinearGradient(0, entry[1], entry[0], entry[1])
  beam.addColorStop(0, `rgba(${ink},0)`); beam.addColorStop(0.55, `rgba(${ink},.06)`); beam.addColorStop(1, `rgba(${ink},.95)`)
  ctx.strokeStyle = beam; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(0, entry[1] - entry[0] * 0.08); ctx.lineTo(entry[0], entry[1]); ctx.stroke()
  // prism body and the ray inside it
  ctx.beginPath(); ctx.moveTo(...vertices[0]); ctx.lineTo(...vertices[1]); ctx.lineTo(...vertices[2]); ctx.closePath()
  ctx.fillStyle = `rgba(${ink},.07)`; ctx.fill(); ctx.strokeStyle = `rgba(${ink},.45)`; ctx.lineWidth = 1.5; ctx.stroke()
  ctx.strokeStyle = `rgba(${ink},.7)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(...entry); ctx.lineTo(...exit); ctx.stroke()
  // spectral fan: violet bends the most
  const direction = Math.atan2(exit[1] - entry[1], exit[0] - entry[0]), deviation = 0.28 + (pointer.x - 0.5) * 0.5, spread = 0.26 + Math.abs(Math.sin(time * 0.7)) * 0.03
  ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'
  const length = width + height, center = direction + deviation + 0.06
  ctx.globalAlpha = 1
  for (let slice = 0; slice < FAN_SLICES; slice++) {
    const from = center + spread * (slice / FAN_SLICES - 0.5), to = center + spread * ((slice + 1) / FAN_SLICES - 0.5) + 0.004, middle = (from + to) / 2
    const rgb = colorAt((slice + 0.5) / (FAN_SLICES - 1)).join(',')
    const fade = ctx.createLinearGradient(exit[0], exit[1], exit[0] + Math.cos(middle) * length * 0.55, exit[1] + Math.sin(middle) * length * 0.55)
    fade.addColorStop(0, `rgba(${rgb},${dark ? 0.95 : 0.85})`); fade.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = fade
    ctx.beginPath(); ctx.moveTo(...exit); ctx.lineTo(exit[0] + Math.cos(from) * length, exit[1] + Math.sin(from) * length); ctx.lineTo(exit[0] + Math.cos(to) * length, exit[1] + Math.sin(to) * length); ctx.closePath(); ctx.fill()
  }
  ctx.globalAlpha = 1
}
