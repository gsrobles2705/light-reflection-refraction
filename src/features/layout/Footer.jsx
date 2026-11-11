import { useMemo } from 'react'
import { useReducedMotion } from 'motion/react'
import BrandMark from '../../components/BrandMark.jsx'
import CopyLinkButton from '../../components/CopyLinkButton.jsx'
import Icon from '../../components/Icon.jsx'
import QrCode from '../../components/QrCode.jsx'
import { COURSE_LINE, SITE_URL } from '../../config/site.js'
import { ROUTE_STAGES } from '../../content/navigation.js'

/**
 * Page footer. A closing band with a wave on top (the same mask as the section waves, see section-flow.css) holds the
 * title, the copy-link button and the QR code; below it come the brand next to the route (five aligned stage columns), a team row and a last
 * line with the course data and the back-to-top button.
 */
export default function Footer({ navItems, team }) {
  const reduceMotion = useReducedMotion()
  const labelOf = useMemo(() => Object.fromEntries(navItems.map((item) => [item.id, item.label])), [navItems])
  const stages = useMemo(
    () => ROUTE_STAGES.map((stage) => ({ ...stage, sections: stage.sections.filter((id) => labelOf[id]) })).filter((stage) => stage.sections.length),
    [labelOf],
  )
  const members = team.filter((member) => member.name)

  return (
    <footer className="foot">
      <div className="fband">
        <div className="wrap fband-in">
          <div className="fband-txt">
            <h2>Explora la luz</h2>
            <p className="fband-scan">Escanea el código con tu celular o escribe:</p>
            <strong className="fband-url">{SITE_URL.replace(/^https?:\/\//, '')}</strong>
            <CopyLinkButton url={SITE_URL} />
          </div>
          <QrCode url={SITE_URL} className="qr" />
        </div>
      </div>
      <div className="wrap fmain">
        <div className="ftop">
          <div className="fid">
            <a className="fbrand" href="#inicio"><BrandMark />Luz en Movimiento</a>
            <p className="fdesc">Un recorrido interactivo por la reflexión y la refracción de la luz: teoría, experimento, laboratorio libre y problemas.</p>
          </div>
          <div role="navigation" aria-label="Recorrido" className="froute-w">
            <h3>Recorrido</h3>
            <ol className="froute">
              {stages.map((stage, i) => (
                <li className="fstage" key={stage.id}>
                  <a href={'#' + stage.sections[0]}><i aria-hidden="true">{i + 1}</i>{stage.label}</a>
                  <ul>{stage.sections.map((id) => <li key={id}><a href={'#' + id}>{labelOf[id]}</a></li>)}</ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
        {members.length > 0 && (
          <div className="fteam-w">
            <h3>Equipo</h3>
            <ul className="fteam">{members.map((member, i) => <li key={i}><span>{member.name}</span>{member.role ? <small>{member.role}</small> : null}</li>)}</ul>
          </div>
        )}
        <div className="fbot">
          <span>{COURSE_LINE}</span>
          <button type="button" className="totop" onClick={() => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}><Icon name="arrowUp" size={16} />Volver arriba</button>
        </div>
      </div>
    </footer>
  )
}
