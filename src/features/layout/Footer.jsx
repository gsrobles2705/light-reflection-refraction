import { useReducedMotion } from 'motion/react'
import BrandMark from '../../components/BrandMark.jsx'
import Icon from '../../components/Icon.jsx'
import { COURSE } from '../../config/site.js'

/** Page footer: brand and course info, section links and team list. */
export default function Footer({ navItems, team }) {
  const reduceMotion = useReducedMotion()
  const chips = [`Curso: ${COURSE.subject}`, COURSE.classroom, COURSE.week, COURSE.term]
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="fgrid">
          <div>
            <a className="fbrand" href="#inicio"><BrandMark />Luz en Movimiento</a>
            <p className="fdesc">Un recorrido interactivo por la reflexión y la refracción de la luz: teoría, experimento, simulador y problemas.</p>
            <div className="chips fchips">{chips.map((chip) => <span className="chip" key={chip}>{chip}</span>)}</div>
          </div>
          <div role="navigation" aria-label="Pie de página"><h4>Explora</h4>
            <ul className="fnav">{navItems.filter((item) => item.id !== 'inicio').map(({ id, label }) => <li key={id}><a href={'#' + id}>{label}</a></li>)}</ul>
          </div>
          {team.length > 0 && (
            <div><h4>Integrantes</h4>
              <ul>{team.map((member, i) => member.name && <li key={i}>{member.name}{member.role ? <small> · {member.role}</small> : null}</li>)}</ul>
            </div>
          )}
        </div>
        <div className="fbot">
          <span>Proyecto de {COURSE.subject} · {COURSE.topic} · {COURSE.classroom} · {COURSE.week} · {COURSE.term} · {new Date().getFullYear()}</span>
          <button type="button" className="totop" onClick={() => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}><Icon name="arrowUp" size={16} />Volver arriba</button>
        </div>
      </div>
    </footer>
  )
}
