const FAN_COLORS = ['#ff5d6c', '#ff9a4d', '#ffd34d', '#7be07a', '#3fe0d0', '#5a9bff', '#a37bff']
const POINTER_SMOOTHING = 0.06
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

/** Eases the pointer toward its target (purely decorative smoothing). */
export function advancePointer(pointer) {
  pointer.x += (pointer.targetX - pointer.x) * POINTER_SMOOTHING
  pointer.y += (pointer.targetY - pointer.y) * POINTER_SMOOTHING
}

/**
 * 2D fallback for browsers without WebGL: a flat prism with a white beam entering from the left and a seven-color
 * fan leaving it. The pointer rotates the prism and moves the entry point.
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
  const direction = Math.atan2(exit[1] - entry[1], exit[0] - entry[0]), deviation = 0.28 + (pointer.x - 0.5) * 0.5, spread = 0.2 + Math.abs(Math.sin(time * 0.7)) * 0.03
  ctx.globalCompositeOperation = dark ? 'lighter' : 'source-over'
  FAN_COLORS.forEach((color, i) => {
    const angle = direction + deviation + (i * spread) / 6 - spread / 2 + 0.06, length = width + height
    const end = [exit[0] + Math.cos(angle) * length, exit[1] + Math.sin(angle) * length]
    ctx.strokeStyle = color; ctx.lineCap = 'round'
    ctx.globalAlpha = dark ? 0.14 : 0.1; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(...exit); ctx.lineTo(...end); ctx.stroke()
    ctx.globalAlpha = dark ? 0.9 : 0.85; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(...exit); ctx.lineTo(...end); ctx.stroke()
  })
  ctx.globalAlpha = 1
}
