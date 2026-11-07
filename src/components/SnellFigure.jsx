import { ORIGIN, pointAt, Ray, Arrow, Angle, Caption } from './Diagram.jsx'

/** Small refraction diagram: the ray comes from the top medium and the refracted ray goes below. `shade` tints the denser medium. */
export default function SnellFigure({ a1, a2, top, bottom, labels, shade = 'top' }) {
  const incoming = pointAt(110, a1, true, -1), refracted = pointAt(104, a2, false, 1)
  return (
    <svg className="hfig" viewBox="0 0 320 240" role="img" aria-label={`Rayo incidente a ${labels[0]} y refractado a ${labels[1]}`}>
      <rect x="0" y={shade === 'top' ? 0 : 120} width="320" height="120" fill="var(--c)" opacity=".12" />
      <line x1="160" y1="12" x2="160" y2="228" stroke="var(--mute)" strokeWidth="1.5" strokeDasharray="5 6" opacity=".7" />
      <line x1="0" y1="120" x2="320" y2="120" stroke="var(--ink)" strokeWidth="2" opacity=".7" />
      <Caption x="166" y="232">normal</Caption>
      <Ray from={incoming} to={ORIGIN} /><Arrow from={incoming} to={ORIGIN} /><Ray from={ORIGIN} to={refracted} delay={450} /><Arrow from={ORIGIN} to={refracted} delay={900} />
      <Angle degrees={a1} up side={-1} radius={46} label={labels[0]} delay={500} /><Angle degrees={a2} up={false} side={1} radius={44} label={labels[1]} delay={900} />
      <Caption x="10" y="18">{top}</Caption><Caption x="10" y="226">{bottom}</Caption>
    </svg>
  )
}
