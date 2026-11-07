import { ORIGIN, pointAt, Ray, Arrow, Angle, Caption, Summary } from '../../components/Diagram.jsx'
import { INDEX } from '../../domain/media.js'
import { refractedAngleDegrees } from '../../domain/optics.js'

// History figures reuse the theory diagram toolkit: translucent angle wedges, arcs, ticks, arrows and captions.
// Canvas is 320 × 264; the lower strip (y > 240) holds the numeric summary.
const comma = (value, digits = 2) => value.toFixed(digits).replace('.', ',')
const N_WATER = INDEX.water
const dot = (x, y, r = 4.5) => <circle cx={x} cy={y} r={r} fill="var(--c)" />
const Normal = () => (<><line x1="160" y1="12" x2="160" y2="228" stroke="var(--mute)" strokeWidth="1.5" strokeDasharray="5 6" opacity=".7" /><Caption x="166" y="22">normal</Caption></>)
const Surface = ({ dense, y = 120 }) => (<>
  {dense && <rect x="0" y={y} width="320" height={240 - y} fill="var(--c)" opacity=".12" />}
  <line x1="0" y1={y} x2="320" y2={y} stroke="var(--ink)" strokeWidth={dense ? 1.5 : 5} opacity={dense ? 0.6 : 0.85} />
</>)
const Dashed = ({ d, opacity = 0.55, width = 2 }) => <path d={d} fill="none" stroke="var(--mute)" strokeWidth={width} strokeDasharray="4 6" strokeLinecap="round" opacity={opacity} />

/** Ray that goes through the origin, with direction arrows on both halves. */
const Bounce = ({ from, to, delay2 = 450 }) => (<>
  <Ray from={from} to={ORIGIN} /><Arrow from={from} to={ORIGIN} /><Ray from={ORIGIN} to={to} delay={delay2} /><Arrow from={ORIGIN} to={to} delay={delay2 + 450} />
</>)

function Refraction({ a1, a2, summary, children }) {
  const incoming = pointAt(118, a1, true, -1), refracted = pointAt(112, a2, false, 1)
  return (<>
    <Surface dense /><Normal />
    <Bounce from={incoming} to={refracted} />
    <Angle degrees={a1} up side={-1} radius={50} label="θ₁" delay={500} /><Angle degrees={a2} up={false} side={1} radius={48} label="θ₂" delay={900} />
    <Caption x="10" y="108">aire · n₁ = 1,00</Caption><Caption x="10" y="226">agua · n₂ = {comma(N_WATER)}</Caption>
    {children}<Summary x="160" y="258" anchor="middle">{summary}</Summary>
  </>)
}

const SNELL_ANGLE = refractedAngleDegrees(INDEX.air, N_WATER, 50)

// Fermat: time along A → crossing → B with the slower medium below (relative to the straight line)
const FERMAT_A = [50, 40], FERMAT_B = [270, 200]
const fermatTime = (x) => Math.hypot(x - FERMAT_A[0], 80) + N_WATER*Math.hypot(FERMAT_B[0] - x, 80)
const fermatBest = (() => { let low = 50, high = 270; for (let i = 0; i < 40; i++) { const m1 = low + (high - low)/3, m2 = high - (high - low)/3; if (fermatTime(m1) < fermatTime(m2)) high = m2; else low = m1 } return (low + high)/2 })()
const fermatPercent = Math.round(fermatTime(fermatBest)/fermatTime(160)*100)

// Huygens: secondary wavelets in the slower medium; radii shrink linearly with the arrival delay
const WAVE_K = 0.5, WAVE_ANGLE_1 = Math.asin(WAVE_K*N_WATER), WAVE_ANGLE_2 = Math.asin(WAVE_K)
const WAVE_CENTERS = [90, 120, 150, 180].map((x) => ({ x, r: 56 - WAVE_K*(x - 90) }))
const waveFront = (x) => 120 + (56 - WAVE_K*(x - 90))/Math.cos(WAVE_ANGLE_2)

const LENS_RAYS = [70, 95, 120, 145, 170].map((y) => { const edge = 22.5*(1 - ((y - 120)/80)**2); return { y, left: 160 - edge, right: 160 + edge } })
const SPECTRUM = ['#ff5a5a', '#ffa94d', '#ffe14d', '#6ee07a', '#4db8ff', '#a98bff']

const FIGURES = {
  rays: () => (<>
    <ellipse cx="50" cy="120" rx="26" ry="16" fill="none" stroke="var(--ink)" strokeWidth="2.5" opacity=".8" />{dot(50, 120, 7)}
    {[96, 120, 144].map((y, i) => { const to = [i === 1 ? 248 : 256, y]; return (<g key={y}><Ray from={[78, 120]} to={to} delay={i*150} /><Arrow from={[78, 120]} to={to} position={0.62} delay={500 + i*150} /></g>) })}
    <circle cx="282" cy="120" r="34" fill="var(--c)" opacity=".3" stroke="var(--c)" strokeWidth="2" />
    <Caption x="50" y="156" anchor="middle">ojo</Caption><Caption x="282" y="172" anchor="middle">objeto</Caption><Caption x="160" y="74" anchor="middle">«rayos visuales» que salen del ojo</Caption>
    <Summary x="160" y="258" anchor="middle">Idea antigua (errónea)</Summary>
  </>),
  reflection: () => (<>
    <Surface /><Normal />
    <Bounce from={pointAt(118, 40, true, -1)} to={pointAt(118, 40, true, 1)} />
    <Angle degrees={40} up side={-1} radius={56} label="θᵢ" tick delay={500} /><Angle degrees={40} up side={1} radius={56} label="θᵣ" tick delay={900} />
    {dot(160, 120)}<Caption x="10" y="144">espejo</Caption><Caption x="10" y="18">rayo incidente</Caption><Caption x="310" y="18" anchor="end">rayo reflejado</Caption>
    <Summary x="160" y="258" anchor="middle">θᵢ = θᵣ = 40°</Summary>
  </>),
  heron: () => (<>
    <Surface /><line x1="160" y1="40" x2="160" y2="200" stroke="var(--mute)" strokeWidth="1.5" strokeDasharray="5 6" opacity=".6" />
    <Dashed d="M60 30 L105 120 L260 30" /><Dashed d="M60 30 L260 210" opacity={0.8} width={1.6} />
    <Bounce from={[60, 30]} to={[260, 30]} />
    <Angle degrees={48} up side={-1} radius={40} label="θᵢ" tick delay={500} /><Angle degrees={48} up side={1} radius={40} label="θᵣ" tick delay={900} />
    <circle cx="260" cy="210" r="5" fill="none" stroke="var(--mute)" strokeWidth="1.8" strokeDasharray="3 3" />
    {dot(60, 30)}{dot(260, 30)}{dot(160, 120)}<circle cx="105" cy="120" r="3.5" fill="var(--bg)" stroke="var(--mute)" strokeWidth="1.8" />
    <Caption x="60" y="16" anchor="middle">A</Caption><Caption x="260" y="16" anchor="middle">B</Caption><Caption x="252" y="228" anchor="end">B′ (imagen de B)</Caption>
    <Caption x="84" y="100" anchor="end">más largo</Caption><Caption x="10" y="144">espejo</Caption>
    <Summary x="160" y="258" anchor="middle">Camino más corto ⇒ θᵢ = θᵣ</Summary>
  </>),
  ptolemy: () => (
    <Refraction a1={40} a2={29} summary="Ptolomeo midió: 40° → 29°">
      <Caption x="312" y="40" anchor="end">su tabla (aire → agua)</Caption><Caption x="312" y="58" anchor="end">20° → 15,5°</Caption><Caption x="312" y="74" anchor="end">40° → 29°</Caption><Caption x="312" y="90" anchor="end">60° → 40,5°</Caption>
    </Refraction>
  ),
  lens: () => (<>
    <line x1="10" y1="120" x2="300" y2="120" stroke="var(--mute)" strokeWidth="1.2" strokeDasharray="4 6" opacity=".6" />
    <polygon points={`${LENS_RAYS[0].right},70 262,120 ${LENS_RAYS[4].right},170`} fill="var(--c)" opacity=".1" />
    <path d="M160 40 Q205 120 160 200 Q115 120 160 40 Z" fill="var(--c)" fillOpacity=".16" stroke="var(--c)" strokeWidth="2.5" strokeLinejoin="round" />
    {LENS_RAYS.map(({ y, left, right }, i) => (<g key={y}>
      <Ray from={[10, y]} to={[left, y]} delay={i*80} width={3} /><Arrow from={[10, y]} to={[left, y]} position={0.5} delay={300 + i*80} />
      <Ray from={[right, y]} to={[262, 120]} delay={600 + i*80} width={3} /><Arrow from={[right, y]} to={[262, 120]} position={0.55} delay={900 + i*80} />
    </g>))}
    {dot(262, 120, 6)}<Caption x="12" y="52">rayos paralelos</Caption><Caption x="160" y="224" anchor="middle">lente de vidrio</Caption><Caption x="262" y="146" anchor="middle">foco</Caption>
    <Summary x="160" y="258" anchor="middle">La lente dobla cada rayo hacia el foco</Summary>
  </>),
  eye: () => (<>
    <circle cx="46" cy="40" r="15" fill="#ffd34d" /><circle cx="46" cy="40" r="23" fill="none" stroke="#ffd34d" strokeWidth="2" opacity=".5" />
    <circle cx="160" cy="150" r="26" fill="var(--c)" opacity=".3" stroke="var(--c)" strokeWidth="2" />
    <Ray from={[60, 52]} to={[142, 132]} /><Arrow from={[60, 52]} to={[142, 132]} /><Ray from={[178, 132]} to={[252, 80]} delay={450} /><Arrow from={[178, 132]} to={[252, 80]} delay={900} />
    <ellipse cx="276" cy="70" rx="24" ry="15" fill="none" stroke="var(--ink)" strokeWidth="2.5" opacity=".8" />{dot(276, 70, 7)}
    <Caption x="46" y="76" anchor="middle">Sol</Caption><Caption x="160" y="192" anchor="middle">objeto</Caption><Caption x="276" y="102" anchor="middle">ojo</Caption>
    <Caption x="112" y="90">luz que llega</Caption><Caption x="204" y="134">luz que rebota</Caption>
    <Summary x="160" y="258" anchor="middle">La luz entra al ojo: así vemos</Summary>
  </>),
  snell: () => <Refraction a1={50} a2={SNELL_ANGLE} summary={`1·sen 50° = ${comma(N_WATER)}·sen θ₂ → θ₂ ≈ ${Math.round(SNELL_ANGLE)}°`} />,
  sines: () => {
    const R = 96, incoming = pointAt(R, 50, true, -1), refracted = pointAt(R, SNELL_ANGLE, false, 1)
    return (<>
      <Surface dense /><Normal /><circle cx="160" cy="120" r={R} fill="none" stroke="var(--mute)" strokeWidth="1.3" strokeDasharray="3 6" opacity=".5" />
      <Bounce from={incoming} to={refracted} />
      <Dashed d={`M${incoming[0].toFixed(1)} ${incoming[1].toFixed(1)} L160 ${incoming[1].toFixed(1)}`} /><Dashed d={`M${refracted[0].toFixed(1)} ${refracted[1].toFixed(1)} L160 ${refracted[1].toFixed(1)}`} />
      <line className="dgfade" x1={incoming[0]} y1={incoming[1]} x2="160" y2={incoming[1]} stroke="var(--c)" strokeWidth="5" strokeLinecap="round" style={{ '--d': '1000ms' }} />
      <line className="dgfade" x1={refracted[0]} y1={refracted[1]} x2="160" y2={refracted[1]} stroke="var(--c)" strokeWidth="5" strokeLinecap="round" style={{ '--d': '1300ms' }} />
      <Angle degrees={50} up side={-1} radius={28} label="θ₁" delay={500} /><Angle degrees={SNELL_ANGLE} up={false} side={1} radius={28} label="θ₂" delay={900} />
      <Caption x={(incoming[0] + 160)/2} y={incoming[1] - 9} anchor="middle">sen θ₁</Caption><Caption x={(refracted[0] + 160)/2} y={refracted[1] + 17} anchor="middle">sen θ₂</Caption>
      <Caption x="10" y="108">aire</Caption><Caption x="10" y="226">agua</Caption>
      <Summary x="160" y="258" anchor="middle">sen θ₁ ÷ sen θ₂ = {comma(N_WATER)} (siempre)</Summary>
    </>)
  },
  fermat: () => {
    const [ax, ay] = FERMAT_A, [bx, by] = FERMAT_B, best = fermatBest.toFixed(1)
    return (<>
      <Surface dense />
      <Dashed d={`M${ax} ${ay} L${bx} ${by}`} opacity={0.8} width={2.2} />
      <Ray from={FERMAT_A} to={[fermatBest, 120]} /><Arrow from={FERMAT_A} to={[fermatBest, 120]} /><Ray from={[fermatBest, 120]} to={FERMAT_B} delay={450} /><Arrow from={[fermatBest, 120]} to={FERMAT_B} delay={900} />
      {dot(ax, ay)}{dot(bx, by)}{dot(best, 120, 4)}
      <Caption x={ax} y={ay - 12} anchor="middle">A</Caption><Caption x={bx} y={by + 20} anchor="middle">B</Caption>
      <line x1="150" y1="20" x2="176" y2="20" stroke="var(--mute)" strokeWidth="2.2" strokeDasharray="4 6" /><Caption x="182" y="24">recta: la más corta</Caption>
      <line x1="150" y1="40" x2="176" y2="40" stroke="var(--c)" strokeWidth="3.5" strokeLinecap="round" /><Caption x="182" y="44">real: la más rápida</Caption>
      <Caption x="10" y="108">aire (rápida)</Caption><Caption x="10" y="226">agua (lenta)</Caption>
      <Summary x="160" y="258" anchor="middle">Tiempo: recta 100 % → real {fermatPercent} %</Summary>
    </>)
  },
  prism: () => (<>
    <polygon points="150,40 100,160 200,160" fill="var(--c)" opacity=".16" stroke="var(--c)" strokeWidth="2.5" strokeLinejoin="round" />
    <Ray from={[10, 118]} to={[121.7, 108]} width={4} /><Arrow from={[10, 118]} to={[121.7, 108]} position={0.5} />
    <Ray from={[121.7, 108]} to={[182.5, 118]} width={3} delay={450} />
    <polygon className="dgfade" points="182.5,118 312,162 312,197" fill="var(--c)" opacity=".1" style={{ '--d': '1000ms' }} />
    {SPECTRUM.map((color, i) => <path key={color} className="draw" pathLength="1" d={`M182.5 118 L312 ${162 + i*7}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" style={{ '--d': `${800 + i*120}ms` }} />)}
    <Caption x="12" y="104">luz blanca</Caption><Caption x="308" y="148" anchor="end">rojo</Caption><Caption x="308" y="216" anchor="end">violeta</Caption><Caption x="150" y="184" anchor="middle">prisma</Caption>
    <Summary x="160" y="258" anchor="middle">n rojo ≈ 1,51 · n violeta ≈ 1,53</Summary>
  </>),
  wave: () => {
    const sinT = Math.sin(WAVE_ANGLE_1), cosT = Math.cos(WAVE_ANGLE_1), front = [[190, 120], [190 + 90*cosT, 120 - 90*sinT]]
    const arrowFrom = [(front[0][0] + front[1][0])/2 - 24*sinT, (front[0][1] + front[1][1])/2 - 24*cosT], arrowTo = [arrowFrom[0] + 30*sinT, arrowFrom[1] + 30*cosT]
    return (<>
      <Surface dense />
      {WAVE_CENTERS.map(({ x, r }, i) => <path key={x} className="dgfade" d={`M${x - r} 120 A${r} ${r} 0 0 0 ${x + r} 120`} fill="var(--c)" fillOpacity=".12" stroke="var(--c)" strokeWidth="2" style={{ '--d': `${300 + i*200}ms` }} />)}
      {WAVE_CENTERS.map(({ x }) => <circle key={x} cx={x} cy="120" r="3" fill="var(--ink)" opacity=".8" />)}
      <Ray from={[70, waveFront(70)]} to={[200, waveFront(200)]} width={4} delay={1000} />
      <Ray from={front[0]} to={front[1]} width={4} /><Arrow from={arrowFrom} to={arrowTo} position={1} />
      <Caption x="312" y="22" anchor="end">frente de onda incidente</Caption><Caption x="312" y="38" anchor="end">v₁ (rápida)</Caption>
      <Caption x="12" y="226">ondas secundarias · v₂ (lenta)</Caption><Caption x="208" y="142">nuevo frente</Caption>
      <Summary x="160" y="258" anchor="middle">sen θ₁ ÷ sen θ₂ = v₁ ÷ v₂ = {comma(N_WATER)}</Summary>
    </>)
  },
}

export default function HistoryFigure({ name, label }) {
  const Figure = FIGURES[name]
  if (!Figure) return null
  return <svg className="hfig" viewBox="0 0 320 264" role="img" aria-label={label}><Figure /></svg>
}
