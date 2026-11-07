import { ORIGIN, pointAt, Ray, Arrow, Angle, Caption } from '../../components/Diagram.jsx'

/** A ray that makes 35° with the mirror: the angle that counts is the one with the normal (55°). */
export default function NormalTip() {
  const incoming = pointAt(112, 55, true, -1), reflected = pointAt(112, 55, true, 1)
  return (
    <svg className="hfig" viewBox="0 0 320 190" role="img" aria-label="Un rayo forma 35 grados con el espejo, por lo que el ángulo de incidencia con la normal es 55 grados">
      <line x1="20" y1="120" x2="300" y2="120" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" opacity=".85" />
      <line x1="160" y1="14" x2="160" y2="176" stroke="var(--mute)" strokeWidth="1.5" strokeDasharray="5 6" opacity=".7" />
      <Caption x="166" y="24">normal</Caption><Caption x="22" y="144">espejo</Caption>
      <Ray from={incoming} to={ORIGIN} /><Arrow from={incoming} to={ORIGIN} /><Ray from={ORIGIN} to={reflected} delay={450} /><Arrow from={ORIGIN} to={reflected} delay={900} />
      <Angle degrees={55} up side={-1} radius={50} label="55°" delay={700} /><Angle degrees={55} up side={1} radius={50} label="55°" tick delay={1000} />
      <path className="draw" pathLength="1" d="M98 120 A62 62 0 0 1 109.2 84.4" fill="none" stroke="var(--err)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" style={{ '--d': '300ms' }} />
      <text x="70" y="100" textAnchor="middle" fill="var(--err)" fontSize="13" fontWeight="800">35° ✗</text>
    </svg>
  )
}
