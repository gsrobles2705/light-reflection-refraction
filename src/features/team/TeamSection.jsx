import { Reveal, SectionHead } from '../../components/ui'
import { ACCENT_HUES } from '../../config/palette.js'
import { IS_DEV } from '../../config/runtime.js'

const initialsOf = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join('')

/** Team cards. Members without a name are placeholders and only appear in development (see content/team.js). */
export default function TeamSection({ team }) {
  return (
    <section id="integrantes" className="alt"><div className="wrap">
      <SectionHead tag="Equipo" title="Integrantes del grupo" />
      <div className="team">
        {team.map((member, i) => (
          <Reveal key={i} delay={i * 0.05} className="member-w">
            <div className={'member ' + (member.name ? '' : 'dev')} style={{ '--c': ACCENT_HUES[i % ACCENT_HUES.length] }}>
              {member.photo
                ? <img className="av photo" src={member.photo} alt={`Foto de ${member.name}`} />
                : <div className="av" aria-hidden="true">{member.name ? initialsOf(member.name) : '?'}</div>}
              <h3>{member.name || '[Nombre pendiente]'}</h3>
              {(member.role || IS_DEV) && <p>{member.role || '[Rol por definir]'}</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </div></section>
  )
}
