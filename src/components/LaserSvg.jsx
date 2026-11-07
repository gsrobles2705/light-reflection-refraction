import { useId } from 'react'

// SVG counterparts of the canvas laser and beam (rendering/laser.js): same colors, shapes, glow and moving
// wavefronts. If you change the look in one place, change it in the other too.

const WAVEFRONT_SPEED = 150   // px/s in a medium with n = 1 (same as the canvas version)
const WAVEFRONT_SPACING = 46

/**
 * Beam from (x1,y1) to (x2,y2).
 * @param {object} props
 * @param {number} props.x1
 * @param {number} props.y1
 * @param {number} props.x2
 * @param {number} props.y2
 * @param {string} props.color
 * @param {number} [props.intensity] energy in 0–1 (thickness and brightness)
 * @param {number} [props.mediumIndex] refractive index; wavefronts move slower where it is higher
 * @param {number} [props.scale] SVG viewBoxes are smaller than the canvas, so sizes are scaled down
 * @param {boolean} [props.wavefronts] draw the moving wavefront ticks
 */
export function BeamSVG({ x1, y1, x2, y2, color, intensity = 1, mediumIndex = 1, scale = 1, wavefronts = true }) {
  const strength = Math.max(0.04, intensity), length = Math.hypot(x2 - x1, y2 - y1)
  const spacing = (WAVEFRONT_SPACING * scale) / mediumIndex, halfHeight = 9 * (0.5 + strength * 0.5) * scale
  return (
    <g strokeLinecap="round" fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={(1.5 + 4.5 * strength) * scale} opacity={0.18 + 0.6 * strength} style={{ filter: `drop-shadow(0 0 ${(8 + 16 * strength) * scale * 0.5}px ${color})` }} />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={(0.8 + 1.8 * strength) * scale} opacity={0.25 + 0.65 * strength} />
      {wavefronts && length > spacing && (
        <line className="lz-flow" x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeLinecap="butt" strokeWidth={halfHeight * 2} strokeDasharray={`${3 * scale} ${spacing - 3 * scale}`}
          opacity={0.5 + 0.5 * strength} style={{ '--sp': spacing, animationDuration: `${(spacing / (WAVEFRONT_SPEED * scale)) * mediumIndex}s` }} />
      )}
    </g>
  )
}

/** Laser whose beam starts at (x, y), pointing `angle` degrees (0 = right, clockwise on screen). */
export function LaserSVG({ x, y, angle, color, scale = 1 }) {
  const gradientId = 'lzb' + useId().replace(/:/g, '')
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      <defs><linearGradient id={gradientId} x1="0" x2="0" y1="-10" y2="10" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#7d8f98" /><stop offset=".45" stopColor="#33444b" /><stop offset="1" stopColor="#10181c" /></linearGradient></defs>
      <rect x="-58" y="-10" width="58" height="20" rx="5" fill={`url(#${gradientId})`} style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,.55))' }} />
      <rect x="-40" y="-11" width="5" height="22" fill="#9fb2bb" /><rect x="-30" y="-11" width="3" height="22" fill="#9fb2bb" />
      <rect x="-6" y="-6" width="7" height="12" fill="#c9d6db" />
      <circle cx="-18" cy="0" r="3.2" fill={color} />
      <circle cx="2" cy="0" r="3.6" fill="#fff" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
    </g>
  )
}
