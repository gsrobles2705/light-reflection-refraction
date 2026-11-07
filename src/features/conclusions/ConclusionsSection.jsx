import Diagram from '../../components/Diagram.jsx'
import Icon from '../../components/Icon.jsx'
import { Reveal, SectionHead } from '../../components/ui'
import { CONCLUSIONS, CONCLUSIONS_KEY_IDEA } from '../../content/conclusions.js'

/** Numbered conclusions, each with a diagram (or the lab-accuracy badge) and a closing key idea. */
export default function ConclusionsSection() {
  return (
    <section id="conclusiones" className="alt"><div className="wrap">
      <SectionHead tag="Conclusiones" title="Lo que aprendimos" />
      <ol className="concl">
        {CONCLUSIONS.map((conclusion, i) => (
          <Reveal key={i} delay={i * 0.06} className="cc-w">
            <li className="cc" style={{ '--c': conclusion.color || 'var(--at)' }}>
              <div className="cc-vis" aria-hidden={conclusion.diagram == null ? 'true' : undefined}>
                {conclusion.diagram != null
                  ? <Diagram kind={conclusion.diagram} />
                  : <div className="cc-ok"><strong>&lt; 5 %</strong><span>de error: medida y teoría coinciden</span></div>}
              </div>
              <div className="cc-body">
                <div className="cc-head"><span className="pn" aria-hidden="true">{i + 1}</span><h3>{conclusion.title}</h3></div>
                <p>{conclusion.text}</p>
                {conclusion.formula && <code className="cc-f">{conclusion.formula}</code>}
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
      <Reveal delay={0.3}>
        <p className="cc-key"><Icon name="sun" size={26} /><span><b>La idea que lo une todo</b>{CONCLUSIONS_KEY_IDEA}</span></p>
      </Reveal>
    </div></section>
  )
}
