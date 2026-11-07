import { MEDIA } from '../../domain/media.js'

const capitalize = (text) => text[0].toUpperCase() + text.slice(1)

/**
 * Plain-language explanation of what happens in the current scene; it rewrites itself on every change.
 * Returns `{ title, color, text }` (color is a CSS variable reference).
 */
export function explainScene(scene, model) {
  const from = MEDIA[scene.firstMedium].name.toLowerCase(), to = MEDIA[scene.secondMedium].name.toLowerCase()
  const angle = scene.incidentAngle.toFixed(1), { n1, n2 } = model
  const shiftNote = model.lateralShiftCm != null ? ` En la placa, el rayo sale paralelo al original pero desplazado ${model.lateralShiftCm.toFixed(2)} cm.` : ''

  if (model.totalInternalReflection) {
    return { title: 'Reflexión total interna', color: 'var(--err)', text: `Con ${angle}° la luz ya no puede salir de ${from}: supera el ángulo crítico (${model.criticalDegrees.toFixed(1)}°). Todo el rayo rebota hacia adentro, como dentro de una fibra óptica.${shiftNote}` }
  }
  if (n1 === n2) {
    return { title: 'Mismo material', color: 'var(--mute)', text: `Como los dos materiales son iguales, la luz sigue recta. Cambia uno de ellos para ver cómo se dobla.${shiftNote}` }
  }
  const refracted = model.refractedDegrees.toFixed(1)
  if (n2 > n1) {
    return { title: 'El rayo se acerca a la normal', color: 'var(--at)', text: `La luz pasa de ${from} a ${to}. ${capitalize(to)} frena más la luz (n = ${n2.toFixed(2)} frente a ${n1.toFixed(2)}), así que el rayo se acerca a la línea vertical (la normal): baja de ${angle}° a ${refracted}°.${shiftNote}` }
  }
  return { title: 'El rayo se aleja de la normal', color: 'var(--bt)', text: `La luz pasa de ${from} a ${to}. ${capitalize(to)} frena menos la luz (n = ${n2.toFixed(2)} frente a ${n1.toFixed(2)}), así que el rayo se aleja de la línea vertical (la normal): sube de ${angle}° a ${refracted}°.${shiftNote}` }
}
