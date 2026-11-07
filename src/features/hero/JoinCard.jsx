import { useMemo } from 'react'
import { SITE_URL } from '../../config/site.js'
import qrcode from '../../lib/qrcode.js'

const QUIET_ZONE = 4   // modules of white margin around the code (QR spec minimum)

/** QR code rendered as a single SVG path, generated in the browser (no external service). */
function QrCode({ url }) {
  const { path, size } = useMemo(() => {
    const qr = qrcode(0, 'M')
    qr.addData(url)
    qr.make()
    const modules = qr.getModuleCount()
    let path = ''
    for (let row = 0; row < modules; row++) for (let column = 0; column < modules; column++) if (qr.isDark(row, column)) path += `M${column + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`
    return { path, size: modules + 2 * QUIET_ZONE }
  }, [url])
  return (
    <svg className="qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Código QR que abre ${url}`} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" /><path d={path} fill="#080a18" />
    </svg>
  )
}

/** "Join" card: QR code plus the plain-text address, so a projected page can be opened from a phone. */
export default function JoinCard() {
  return (
    <div className="join" aria-label="Entra y participa">
      <QrCode url={SITE_URL} />
      <div>
        <span className="tag">Entra y participa</span>
        <p className="joinp">Escanea el código con tu celular o escribe:</p>
        <strong className="joinurl">{SITE_URL.replace(/^https?:\/\//, '')}</strong>
      </div>
    </div>
  )
}
