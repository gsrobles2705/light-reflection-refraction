import AppIcon from '../../components/AppIcon.jsx'
import { Reveal, SectionHead } from '../../components/ui'
import { APPLICATIONS } from '../../content/applications.js'

/** Grid of real-life applications of reflection and refraction. */
export default function ApplicationsSection() {
  return (
    <section id="aplicaciones" className="alt"><div className="wrap">
      <SectionHead tag="Aplicaciones" title="Aplicaciones en la vida real" lead="La reflexión y la refracción están detrás de tecnologías y fenómenos que usamos y vemos todos los días." />
      <div className="apps">
        {APPLICATIONS.map((application, i) => (
          <Reveal key={application.title} delay={(i % 3) * 0.05} className="app-w">
            <div className="app" style={{ '--c': application.color }}>
              <div className="ico"><AppIcon name={application.icon} size={62} /></div>
              <h3>{application.title}</h3><p>{application.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div></section>
  )
}
