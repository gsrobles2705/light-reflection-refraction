// Ray diagrams that "draw themselves" when a tab changes (pure CSS animation, see .draw / .dgfade in the stylesheet).
// Every angle is marked with a translucent wedge plus an arc between the normal and the ray.

export const ORIGIN = [160, 120]
const format = (n) => n.toFixed(1)   // geometry for SVG attributes: always a decimal point
const toRadians = (degrees) => (degrees * Math.PI) / 180

/** Point at `radius` from the origin, `degrees` away from the normal (`up`: above/below the surface, `side`: -1 left, +1 right). */
export const pointAt = (radius, degrees, up, side) => [ORIGIN[0] + side * radius * Math.sin(toRadians(degrees)), ORIGIN[1] + (up ? -1 : 1) * radius * Math.cos(toRadians(degrees))]

export const Ray = ({ from, to, width = 3.5, opacity = 1, delay = 0 }) => (
  <path className="draw" pathLength="1" d={`M${format(from[0])} ${format(from[1])} L${format(to[0])} ${format(to[1])}`} fill="none" stroke="var(--c)" strokeWidth={width} strokeLinecap="round" opacity={opacity} style={{ '--d': delay + 'ms' }} />
)

/** Arrowhead placed along a ray, showing the direction the light travels. */
export const Arrow = ({ from, to, position = 0.52, delay = 0 }) => {
  const x = from[0] + (to[0] - from[0]) * position, y = from[1] + (to[1] - from[1]) * position
  const heading = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI
  return <polygon className="dgfade" points="-7,-5 6,0 -7,5" transform={`translate(${format(x)} ${format(y)}) rotate(${format(heading)})`} fill="var(--c)" style={{ '--d': delay + 'ms' }} />
}

/** Angle mark: soft wedge + arc + optional equality tick + symbol label (the numeric value goes in <Summary>). */
export const Angle = ({ degrees, radius = 46, up, side, label, delay = 0, tick }) => {
  const normalPoint = [ORIGIN[0], ORIGIN[1] + (up ? -radius : radius)], rayPoint = pointAt(radius, degrees, up, side)
  const sweep = up ? (side < 0 ? 0 : 1) : (side < 0 ? 1 : 0)
  const middle = degrees / 2, labelPoint = pointAt(radius + 17, middle, up, side)
  const tickStart = pointAt(radius - 5, middle, up, side), tickEnd = pointAt(radius + 5, middle, up, side)
  const arc = `A${radius} ${radius} 0 0 ${sweep} ${format(rayPoint[0])} ${format(rayPoint[1])}`
  return (
    <g>
      <path className="dgfade" d={`M${ORIGIN[0]} ${ORIGIN[1]} L${format(normalPoint[0])} ${format(normalPoint[1])} ${arc} Z`} fill="var(--c)" fillOpacity=".13" style={{ '--d': delay + 'ms' }} />
      <path className="draw" pathLength="1" d={`M${format(normalPoint[0])} ${format(normalPoint[1])} ${arc}`} fill="none" stroke="var(--c)" strokeWidth="3" strokeLinecap="round" style={{ '--d': delay + 'ms' }} />
      {tick && <line className="dgfade" x1={format(tickStart[0])} y1={format(tickStart[1])} x2={format(tickEnd[0])} y2={format(tickEnd[1])} stroke="var(--c)" strokeWidth="2.4" style={{ '--d': delay + 200 + 'ms' }} />}
      <text className="dga dgfade" x={format(labelPoint[0])} y={format(labelPoint[1])} textAnchor="middle" dominantBaseline="central" style={{ '--d': delay + 250 + 'ms' }}>{label}</text>
    </g>
  )
}

export const Summary = ({ x, y, children, anchor }) => <text className="dgv dgfade" x={x} y={y} textAnchor={anchor} style={{ '--d': '1100ms' }}>{children}</text>
export const Caption = ({ x, y, children, anchor }) => <text className="dgl" x={x} y={y} textAnchor={anchor}>{children}</text>

const ALT_TEXT = ['Rayo que se refleja con ángulos iguales', 'Rayo que se acerca a la normal al entrar al agua', 'Reflexión total interna dentro del medio de mayor índice']

/**
 * @param {{ kind: 0|1|2 }} props  0 = reflection, 1 = refraction (air → water), 2 = total internal reflection (water → air)
 */
export default function Diagram({ kind }) {
  const belowSurface = kind > 0   // the lower half is a denser medium
  return (
    <svg viewBox="0 0 320 240" role="img" aria-label={ALT_TEXT[kind]}>
      {belowSurface && <rect x="0" y="120" width="320" height="120" fill="var(--c)" opacity=".12" />}
      <line x1="160" y1="12" x2="160" y2="228" stroke="var(--mute)" strokeWidth="1.5" strokeDasharray="5 6" opacity=".7" />
      <line x1="0" y1="120" x2="320" y2="120" stroke="var(--ink)" strokeWidth={belowSurface ? 1.5 : 5} opacity={belowSurface ? 0.6 : 0.85} />
      <Caption x="166" y="22">normal</Caption>

      {kind === 0 && (() => {
        const incoming = pointAt(118, 45, true, -1), outgoing = pointAt(118, 45, true, 1)
        return <>
          <Ray from={incoming} to={ORIGIN} /><Arrow from={incoming} to={ORIGIN} /><Ray from={ORIGIN} to={outgoing} delay={450} /><Arrow from={ORIGIN} to={outgoing} delay={900} />
          <Angle degrees={45} up side={-1} radius={56} label="θᵢ" tick delay={500} /><Angle degrees={45} up side={1} radius={56} label="θᵣ" tick delay={900} />
          <Summary x="160" y="236" anchor="middle">θᵢ = θᵣ = 45°</Summary>
          <Caption x="10" y="144">espejo</Caption><Caption x="10" y="18">rayo incidente</Caption><Caption x="310" y="18" anchor="end">rayo reflejado</Caption>
        </>
      })()}

      {kind === 1 && (() => {
        const incoming = pointAt(122, 50, true, -1), refracted = pointAt(112, 35.1, false, 1), reflected = pointAt(86, 50, true, 1)
        return <>
          <Ray from={incoming} to={ORIGIN} /><Arrow from={incoming} to={ORIGIN} /><Ray from={ORIGIN} to={refracted} delay={450} /><Arrow from={ORIGIN} to={refracted} delay={900} />
          <Ray from={ORIGIN} to={reflected} opacity={0.3} width={2} delay={450} />
          <Angle degrees={50} up side={-1} radius={50} label="θ₁" delay={500} /><Angle degrees={35.1} up={false} side={1} radius={48} label="θ₂" delay={900} />
          <Summary x="312" y="234" anchor="end">θ₁ = 50° → θ₂ ≈ 35°</Summary>
          <Caption x="10" y="108">aire · n₁</Caption><Caption x="10" y="226">agua · n₂</Caption>
        </>
      })()}

      {kind === 2 && (() => {
        const incoming = pointAt(124, 49, false, -1), outgoing = pointAt(124, 49, false, 1)
        return <>
          <Ray from={incoming} to={ORIGIN} /><Arrow from={incoming} to={ORIGIN} /><Ray from={ORIGIN} to={outgoing} delay={450} /><Arrow from={ORIGIN} to={outgoing} delay={900} />
          <path d="M160 120 L304 120" stroke="var(--c)" strokeWidth="2.2" strokeDasharray="3 7" opacity=".85" fill="none" strokeLinecap="round" />
          <Angle degrees={49} up={false} side={-1} radius={52} label="θc" delay={500} />
          <Summary x="312" y="234" anchor="end">θc ≈ 49°</Summary>
          <Caption x="304" y="108" anchor="end">refractado a 90°</Caption><Caption x="10" y="104">n₂ menor (aire)</Caption><Caption x="10" y="226">n₁ mayor (agua)</Caption>
        </>
      })()}
    </svg>
  )
}
