import { useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Angle, Arrow, Caption } from '../../components/Diagram.jsx'
import { Reveal } from '../../components/ui'
import { SETUP_REASONS, SETUP_STATUS } from '../../content/experiment.js'
import { INDEX } from '../../domain/media.js'
import { LASER_ANGLE, MILK_ML, WATER_LITERS, setupReadout } from '../../domain/setup.js'
import { useSmoothed } from '../../hooks/useSmoothed.js'

// Side view of the container (2 L) in a 560 × 426 canvas (the drawing is shifted down to leave room for the laser)
const LEFT = 170, RIGHT = 430, BOTTOM = 350, RIM = 150, HEIGHT = BOTTOM - RIM
const LASER = '#3dff7a'
const comma = (value, digits = 1) => value.toFixed(digits).replace('.', ',')
const toRadians = (degrees) => degrees*Math.PI/180

/** Deterministic droplets of milk: more milk, more droplets (positions are fractions of the water area). */
const DROPLETS = Array.from({ length: 56 }, (_, i) => ({ u: (i*0.6180339887 % 1), v: ((i*i*0.7548776662 + i*0.31) % 1), r: 1 + (i % 3)*0.5, d: (i % 7)*0.6 }))

/** Vertical shift of the drawing inside the SVG (room for the laser above the container). */
const SHIFT = 44

/**
 * The animated setup: container, water level, milk, laser, refracted and reflected beams. The laser can be dragged:
 * `onAngle` receives the angle (from the normal, in whole degrees) of the pointer around the point where the beam hits the water.
 * `shown` holds the target angles printed on the figure, so the numbers do not flicker while the smoothed beam moves.
 */
function SetupFigure({ volume, milk, angle, shown, onAngle }) {
  const id = useId().replace(/:/g, '')
  const svgRef = useRef(null), dragging = useRef(false)
  const readout = setupReadout({ waterLiters: volume, milkMl: milk, incidentDegrees: angle })
  const { look, refractedDegrees, reflectedPercent } = readout
  const level = BOTTOM - HEIGHT*readout.level, pointX = 300
  const sin1 = Math.sin(toRadians(angle)), cos1 = Math.cos(toRadians(angle)), sin2 = Math.sin(toRadians(refractedDegrees)), cos2 = Math.cos(toRadians(refractedDegrees))

  const incidentLength = Math.min(230, (level + 26)/cos1 - 78, (pointX - 90)/sin1)
  const start = [pointX - incidentLength*sin1, level - incidentLength*cos1]
  const reflectedLength = Math.min(150, (level + 26)/cos1, (540 - pointX)/sin1)
  const reflectedEnd = [pointX + reflectedLength*sin1, level - reflectedLength*cos1]
  const refractedLength = Math.min((RIGHT - 4 - pointX)/sin2, (BOTTOM - 4 - level)/cos2)
  const refractedEnd = [pointX + refractedLength*sin2, level + refractedLength*cos2]
  const reflectedStrength = Math.min(1, 0.2 + reflectedPercent*0.06)
  const droplets = DROPLETS.slice(0, Math.round(milk*7))

  const dragTo = (event) => {
    const svg = svgRef.current, point = svg.createSVGPoint()
    point.x = event.clientX; point.y = event.clientY
    const local = point.matrixTransform(svg.getScreenCTM().inverse())
    const degrees = Math.atan2(pointX - local.x, level + SHIFT - local.y)*180/Math.PI
    onAngle(Math.round(Math.min(LASER_ANGLE.max, Math.max(LASER_ANGLE.min, degrees))))
  }
  const grab = {
    onPointerDown: (event) => { dragging.current = true; event.currentTarget.setPointerCapture(event.pointerId); dragTo(event) },
    onPointerMove: (event) => { if (dragging.current) dragTo(event) },
    onPointerUp: () => { dragging.current = false },
    onPointerCancel: () => { dragging.current = false },
  }

  return (
    <svg ref={svgRef} className="slab-svg" viewBox="0 0 560 426" role="img" aria-label={`Láser verde sobre el agua con ${comma(volume, 2)} litros y ${comma(milk)} mililitros de leche: incide a ${angle} grados y se refracta a ${comma(refractedDegrees)} grados`}>
      <defs>
        <filter id={id + 'blur'} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4.5" /></filter>
        <linearGradient id={id + 'beam'} gradientUnits="userSpaceOnUse" x1={pointX} y1={level} x2={refractedEnd[0]} y2={refractedEnd[1]}>
          <stop offset="0" stopColor={LASER} /><stop offset="1" stopColor={LASER} stopOpacity={0.15 + 0.85*look.reach} />
        </linearGradient>
        <clipPath id={id + 'water'}><rect x={LEFT + 3} y={level} width={RIGHT - LEFT - 6} height={BOTTOM - level - 3} /></clipPath>
      </defs>
      <g transform={`translate(0 ${SHIFT})`}>
      <g clipPath={`url(#${id}water)`}>
        <rect x={LEFT} y={level} width={RIGHT - LEFT} height={HEIGHT} fill="#4de3ff" opacity=".2" />
        <rect x={LEFT} y={level} width={RIGHT - LEFT} height={HEIGHT} fill="#ffffff" opacity={look.tint} />
        {droplets.map((drop, i) => <circle key={i} className="slab-drop" cx={LEFT + 8 + drop.u*(RIGHT - LEFT - 16)} cy={level + 6 + drop.v*(BOTTOM - level - 14)} r={drop.r} fill="#fff" style={{ animationDelay: `${drop.d}s` }} />)}
      </g>
      <line x1={LEFT + 3} y1={level} x2={RIGHT - 3} y2={level} stroke="#9fefff" strokeWidth="2.5" opacity=".9" />

      <path d={`M${LEFT} ${RIM - 14} V${BOTTOM} H${RIGHT} V${RIM - 14}`} fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round" opacity=".5" />
      {[[1.8, BOTTOM - HEIGHT*0.9], [2, RIM]].map(([liters, y]) => (
        <g key={liters}><line x1={LEFT - 14} y1={y} x2={LEFT} y2={y} stroke="var(--mute)" strokeWidth="2" /><Caption x={LEFT - 18} y={y + 4} anchor="end">{comma(liters)} L</Caption></g>
      ))}
      <line x1={pointX} y1="-20" x2={pointX} y2="344" stroke="var(--mute)" strokeWidth="1.5" strokeDasharray="5 6" opacity=".6" />
      <Caption x={pointX + 6} y="-8">normal</Caption>

      <g>
        <line x1={start[0]} y1={start[1]} x2={pointX} y2={level} stroke={LASER} strokeWidth="9" strokeLinecap="round" opacity=".18" filter={`url(#${id}blur)`} />
        <line className="slab-flow" x1={start[0]} y1={start[1]} x2={pointX} y2={level} stroke={LASER} strokeWidth="2.6" strokeLinecap="round" />
        <Arrow from={start} to={[pointX, level]} position={0.55} />
        <g className="slab-grab" {...grab}>
          <line x1={start[0]} y1={start[1]} x2={pointX} y2={level} stroke="transparent" strokeWidth="34" strokeLinecap="round" />
          <g transform={`translate(${start[0].toFixed(1)} ${start[1].toFixed(1)}) rotate(${(90 - angle).toFixed(1)})`}>
            <circle r="34" fill="transparent" /><rect x="-78" y="-6" width="78" height="12" rx="4" fill="#232850" stroke={LASER} strokeWidth="1.5" /><rect x="-30" y="-6" width="5" height="12" fill={LASER} opacity=".6" />
            <circle r="6" fill={LASER} /><circle r="12" fill={LASER} opacity=".3" className="slab-pulse" />
          </g>
        </g>
      </g>

      <line x1={pointX} y1={level} x2={reflectedEnd[0]} y2={reflectedEnd[1]} stroke={LASER} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="7 7" opacity={reflectedStrength} className="slab-flow" />
      <line x1={pointX} y1={level} x2={refractedEnd[0]} y2={refractedEnd[1]} stroke={LASER} strokeWidth={10 + look.halo*14} strokeLinecap="round" opacity={look.halo*look.core*0.7} filter={`url(#${id}blur)`} />
      <line x1={pointX} y1={level} x2={refractedEnd[0]} y2={refractedEnd[1]} stroke={`url(#${id}beam)`} strokeWidth="3.4" strokeLinecap="round" opacity={look.core} />
      <circle cx={refractedEnd[0]} cy={refractedEnd[1]} r="6" fill={LASER} opacity={look.core*look.reach*0.8} filter={`url(#${id}blur)`} />
      <circle className="slab-pulse" cx={pointX} cy={level} r="5" fill="#fff" />

      <g transform={`translate(${pointX - 160} ${level - 120})`}>
        <g style={{ '--c': '#ffb347' }}><Angle degrees={angle} up side={-1} radius={46} label={`${shown.incident}°`} /></g>
        <g style={{ '--c': '#ffd34d' }}><Angle degrees={angle} up side={1} radius={34} label={`${shown.incident}°`} tick /></g>
        <g style={{ '--c': '#4de3ff' }}><Angle degrees={refractedDegrees} up={false} side={1} radius={42} label={`${comma(shown.refracted)}°`} /></g>
      </g>

      <Caption x="548" y="-8" anchor="end">aire</Caption>
      <Caption x={LEFT + 12} y={BOTTOM - 10}>agua + leche</Caption>
      <Caption x={(LEFT + RIGHT)/2} y="374" anchor="middle">recipiente de 2 L</Caption>
      <text className="slab-level" x={RIGHT + 12} y={level + 5}>{comma(volume, 2)} L</text>
      </g>
    </svg>
  )
}

/** Slider with its live value; the milk slider also marks the 3 to 6 mL zone that works. */
function Control({ id, label, value, display, range, onChange, zone }) {
  return (
    <div className="slab-control">
      <label htmlFor={id}>{label} <b>{display}</b></label>
      <div className="slab-track">
        {zone && <i className="slab-zone" style={{ left: `${(zone[0] - range.min)/(range.max - range.min)*100}%`, width: `${(zone[1] - zone[0])/(range.max - range.min)*100}%` }} aria-hidden="true" />}
        <input id={id} className="rng" type="range" min={range.min} max={range.max} step={range.step} value={value} onChange={(event) => onChange(+event.target.value)} />
      </div>
      {zone && <small>Zona que funciona: {zone[0]} a {zone[1]} mL</small>}
    </div>
  )
}

/** Interactive recreation of the group's experiment: water level, milk and laser angle. */
export default function SetupLab() {
  const [volume, setVolume] = useState(WATER_LITERS.initial)
  const [milk, setMilk] = useState(MILK_ML.initial)
  const [angle, setAngle] = useState(LASER_ANGLE.initial)
  const smoothVolume = useSmoothed(volume), smoothMilk = useSmoothed(milk), smoothAngle = useSmoothed(angle)
  const readout = setupReadout({ waterLiters: volume, milkMl: milk, incidentDegrees: angle })
  const status = SETUP_STATUS[readout.state]
  const [dragged, setDragged] = useState(false)   // hides the "drag the laser" hint after the first drag
  const reset = () => { setVolume(WATER_LITERS.initial); setMilk(MILK_ML.initial); setAngle(LASER_ANGLE.initial); setDragged(false) }
  const dragAngle = (degrees) => { setDragged(true); setAngle(degrees) }

  return (
    <Reveal><div className="slab">
      <div className="slab-grid">
        <div className="slab-fig">
          <SetupFigure volume={smoothVolume} milk={smoothMilk} angle={smoothAngle} shown={{ incident: angle, refracted: readout.refractedDegrees }} onAngle={dragAngle} />
          {!dragged && <span className="slab-hint" aria-hidden="true">Arrastra el láser para moverlo</span>}
        </div>
        <div className="slab-side">
          <Control id="sl-water" label="Agua" value={volume} display={`${comma(volume, 2)} L`} range={WATER_LITERS} onChange={setVolume} />
          <Control id="sl-milk" label="Leche" value={milk} display={`${comma(milk)} mL`} range={MILK_ML} onChange={setMilk} zone={MILK_ML.ideal} />
          <Control id="sl-angle" label="Ángulo del láser θ₁" value={angle} display={`${angle}°`} range={LASER_ANGLE} onChange={setAngle} />
          <AnimatePresence mode="wait">
            <motion.p key={readout.state} role="status" className={'slab-status ' + status.tone} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>{status.text}</motion.p>
          </AnimatePresence>
          <button type="button" className="btn ghost sm" onClick={reset}>Receta del grupo</button>
        </div>
      </div>
      <div className="slab-read" aria-live="polite">
        <div style={{ '--c': '#ffb347' }}><small>Incidencia</small><b>θ₁ = {angle}°</b><span>en el aire (n = 1)</span></div>
        <div style={{ '--c': '#4de3ff' }}><small>Refracción</small><b>θ₂ = {comma(readout.refractedDegrees)}°</b><span>en el agua (n = {INDEX.water}): se acerca a la normal</span></div>
        <div style={{ '--c': '#ffd34d' }}><small>Reflexión</small><b>θᵣ = {angle}°</b><span>rebota ≈ {comma(readout.reflectedPercent)} % de la luz</span></div>
      </div>
      <div className="slab-why">
        {SETUP_REASONS.map((reason, i) => (
          <motion.div key={reason.title} style={{ '--c': reason.color }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i*0.08, duration: 0.45 }}>
            <h4>{reason.title}</h4><p>{reason.text}</p>
          </motion.div>
        ))}
      </div>
    </div></Reveal>
  )
}
