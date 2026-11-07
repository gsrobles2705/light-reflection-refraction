import { useEffect, useMemo, useRef } from 'react'
import { LaserSVG, BeamSVG } from '../../components/LaserSvg.jsx'
import { toRadians } from '../../domain/units.js'
import { wavelengthToCss } from '../../domain/spectrum.js'

const ORIGIN = [200, 140]
const RAY_COLOR = wavelengthToCss(550)   // same green as the simulator's laser
const TICK_STEP = 5
const LABEL_STEP = 15
const TICK_ANGLES = Array.from({ length: 90 / TICK_STEP + 1 }, (_, i) => i * TICK_STEP)

/** Point at `radius` from the origin, `angle` degrees from the vertical normal; `up` selects the upper (air) half. */
const pointAt = (angle, radius, up) => [ORIGIN[0] + (up ? -1 : 1) * Math.sin(toRadians(angle)) * radius, ORIGIN[1] + (up ? -1 : 1) * Math.cos(toRadians(angle)) * radius]

/** Protractor with the incident ray (air) and the refracted ray (material). The student reads θ₂ where the ray crosses the arc. */
export default function ProtractorFigure({ incident, refracted, material, mystery }) {
  const entry = pointAt(incident, 100, true), exit = pointAt(refracted, 104, false)
  const svgRef = useRef()
  useEffect(() => {   // the wavefront animation repaints the SVG every frame: only run it while the figure is visible
    const observer = new IntersectionObserver(([e]) => svgRef.current?.classList.toggle('off', !e.isIntersecting))
    observer.observe(svgRef.current)
    return () => observer.disconnect()
  }, [])
  const ticks = useMemo(() => TICK_ANGLES.map((angle) => {
    const labeled = angle % LABEL_STEP === 0, outer = labeled ? 92 : 85
    return { angle, labeled, water: [pointAt(angle, 76, false), pointAt(angle, outer, false)], air: [pointAt(angle, 76, true), pointAt(angle, outer, true)], waterLabel: pointAt(angle, 106, false), airLabel: pointAt(angle, 106, true) }
  }), [])
  return (
    <svg ref={svgRef} viewBox="0 0 400 300" className="vsvg" role="img" aria-label={`Láser entrando al ${mystery ? 'material misterioso' : 'agua'} con ángulo de ${incident} grados`}>
      <defs><linearGradient id="vw" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2dd4bf" stopOpacity=".35" /><stop offset="1" stopColor="#1d4ed8" stopOpacity=".15" /></linearGradient></defs>
      <rect x="0" y={ORIGIN[1]} width="400" height={300 - ORIGIN[1]} fill="url(#vw)" />
      <line x1="0" x2="400" y1={ORIGIN[1]} y2={ORIGIN[1]} stroke="rgba(255,255,255,.55)" strokeWidth="2" />
      <path d={`M${pointAt(0, 76, false)} A76 76 0 0 0 ${pointAt(90, 76, false)} L${pointAt(90, 90, false)} A90 90 0 0 1 ${pointAt(0, 90, false)} Z`} fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.3)" />
      <line x1={ORIGIN[0]} x2={ORIGIN[0]} y1="8" y2="292" stroke="rgba(255,255,255,.5)" strokeDasharray="5 5" /><text x={ORIGIN[0] + 6} y="20" className="vt">normal</text>
      {ticks.map(({ angle, labeled, water, air, waterLabel, airLabel }) => (
        <g key={angle}>
          <line x1={water[0][0]} y1={water[0][1]} x2={water[1][0]} y2={water[1][1]} stroke="rgba(255,255,255,.8)" />
          <line x1={air[0][0]} y1={air[0][1]} x2={air[1][0]} y2={air[1][1]} stroke="rgba(255,255,255,.3)" />
          {labeled && <>
            <text x={waterLabel[0]} y={waterLabel[1] + 4} textAnchor="middle" className="vt">{angle}°</text>
            <text x={airLabel[0]} y={airLabel[1] + 4} textAnchor="middle" className="vt dim">{angle}°</text>
          </>}
        </g>
      ))}
      <BeamSVG x1={entry[0]} y1={entry[1]} x2={ORIGIN[0]} y2={ORIGIN[1]} color={RAY_COLOR} scale={0.75} />
      <BeamSVG x1={ORIGIN[0]} y1={ORIGIN[1]} x2={exit[0]} y2={exit[1]} color={RAY_COLOR} intensity={0.85} mediumIndex={material.index} scale={0.75} />
      <LaserSVG x={entry[0]} y={entry[1]} angle={90 - incident} color={RAY_COLOR} scale={0.62} />
      <circle cx={ORIGIN[0]} cy={ORIGIN[1]} r="4" fill="#fff" />
      <text x="12" y={ORIGIN[1] - 10} className="vt big">Aire · n = 1.000</text>
      <text x="12" y="290" className="vt big">{mystery ? 'Material misterioso · n = ?' : `Agua · n = ${material.index}`}</text>
    </svg>
  )
}
