import { useMemo } from 'react'
import qrcode from '../lib/qrcode.js'

const QUIET_ZONE = 4        // modules of white margin around the code (QR spec minimum)
const LOGO_SHARE = 0.22     // the logo plate covers about this share of the code's side: well inside what level H can repair

/**
 * QR code rendered as an SVG, generated in the browser (no external service). It uses the highest error correction
 * level (H, repairs up to 30 % of the code) so the brand mark can sit in the middle without hurting scanning.
 * Set `logo={false}` for a plain code.
 */
export default function QrCode({ url, className = 'qr', logo = true }) {
  const { path, size, modules } = useMemo(() => {
    const qr = qrcode(0, 'H')
    qr.addData(url)
    qr.make()
    const modules = qr.getModuleCount()
    const plate = Math.ceil(modules * LOGO_SHARE) | 1, start = Math.floor((modules - plate) / 2)   // odd size keeps the plate centered on the modules
    const underLogo = (row, column) => logo && row >= start && row < start + plate && column >= start && column < start + plate
    let path = ''
    for (let row = 0; row < modules; row++) for (let column = 0; column < modules; column++) if (qr.isDark(row, column) && !underLogo(row, column)) path += `M${column + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`
    return { path, size: modules + 2 * QUIET_ZONE, modules: { plate, start } }
  }, [url, logo])
  const plateSide = modules.plate, plateX = QUIET_ZONE + modules.start, scale = plateSide / 48   // the mark is drawn on a 48 × 48 grid
  return (
    <svg className={className} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Código QR que abre ${url}`}>
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#0a0e12" shapeRendering="crispEdges" />
      {logo && (
        <g transform={`translate(${plateX} ${plateX}) scale(${scale})`}>
          <defs>
            <linearGradient id="qr-wave" gradientUnits="userSpaceOnUse" x1="12" y1="34" x2="45" y2="34">
              <stop offset="0" stopColor="#ff4d5e" /><stop offset=".17" stopColor="#ff9a3d" /><stop offset=".33" stopColor="#ffd400" /><stop offset=".5" stopColor="#2fcf6a" />
              <stop offset=".67" stopColor="#1fb5d6" /><stop offset=".83" stopColor="#3b6bff" /><stop offset="1" stopColor="#8f5bff" />
            </linearGradient>
          </defs>
          <rect x="1" y="1" width="46" height="46" rx="9" fill="#fff" />
          <path d="M14 8V31" fill="none" stroke="#1b2030" strokeWidth="5.4" strokeLinecap="round" />
          <path d="M14 33C19 22 23 22 28 33S38 44 43 31" fill="none" stroke="url(#qr-wave)" strokeWidth="5.4" strokeLinecap="round" />
          <circle cx="14" cy="33" r="2.4" fill="#fff" stroke="#1b2030" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  )
}
