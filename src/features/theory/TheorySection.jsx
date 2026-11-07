import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import Diagram from '../../components/Diagram.jsx'
import { Reveal, SectionHead } from '../../components/ui'
import { THEORY_TOPICS } from '../../content/theory.js'
import { Daily, Direction, IndexBars, Legend, ReflectionTypes, WorkedExample } from './TheoryBlocks.jsx'

/** Body of a card: plain text and equation, or the richer block selected by `kind`. */
function CardBody({ card, topic }) {
  switch (card.kind) {
    case 'legend': return <Legend items={topic.legend} />
    case 'types': return <ReflectionTypes examples={card.examples} />
    case 'direction': return <Direction />
    case 'indices': return <><p>{card.text}</p>{card.equation && <span className="eq">{card.equation}</span>}<IndexBars /></>
    case 'example': return <WorkedExample />
    case 'daily': return <Daily items={card.items} more={card.more} />
    default: return <><p>{card.text}</p>{card.equation && <span className="eq">{card.equation}</span>}</>
  }
}

/** Three steps that frame the whole topic; the last two buttons open the matching tab. */
function LightIntro({ onPick }) {
  return (
    <div className="tintro">
      <div className="tstep"><i>1</i><b>En un solo medio</b><span>La luz viaja en <em>línea recta</em> (aire, agua, vidrio).</span></div>
      <i className="tarrow" aria-hidden="true" />
      <div className="tstep"><i>2</i><b>Llega a una frontera</b><span>El borde con otro medio: un espejo, el agua, el vidrio…</span></div>
      <i className="tarrow" aria-hidden="true" />
      <div className="tfork">
        <button type="button" style={{ '--c': '#ffb347' }} onClick={() => onPick(0)}><b>Rebota</b><span>Reflexión</span></button>
        <button type="button" style={{ '--c': '#4de3ff' }} onClick={() => onPick(1)}><b>Cambia de dirección al pasar</b><span>Refracción</span></button>
      </div>
    </div>
  )
}

/** Tabbed "key ideas" section with an animated ray diagram per topic. */
export default function TheorySection() {
  const [selected, setSelected] = useState(0)
  const tabRefs = useRef([])
  const topic = THEORY_TOPICS[selected]

  // WAI-ARIA tabs pattern: arrows move between tabs (wrapping), Home/End jump to the extremes
  const onTabKeyDown = (event) => {
    const count = THEORY_TOPICS.length
    const target = { ArrowRight: (selected + 1) % count, ArrowLeft: (selected + count - 1) % count, Home: 0, End: count - 1 }[event.key]
    if (target === undefined) return
    event.preventDefault()
    setSelected(target)
    tabRefs.current[target]?.focus()
  }

  return (
    <section id="contenido"><div className="wrap">
      <SectionHead tag="Contenido" title="Las ideas clave" lead="Cuando la luz llega a la frontera entre dos medios, puede rebotar o seguir su camino cambiando de dirección. Elige una pestaña para verlo." />
      <Reveal><LightIntro onPick={setSelected} /></Reveal>
      <Reveal>
        <div className="tabs" role="tablist" aria-label="Temas" onKeyDown={onTabKeyDown}>
          {THEORY_TOPICS.map((item, i) => (
            <button key={item.id} ref={(element) => (tabRefs.current[i] = element)} role="tab" id={'tab-' + i} aria-selected={selected === i} aria-controls={'panel-' + i}
              tabIndex={selected === i ? 0 : -1} className={selected === i ? 'on' : ''} style={{ '--c': item.color }} onClick={() => setSelected(i)}>
              <span>{item.label}</span>{selected === i && <motion.i layoutId="tabbg" className="tabbg" />}
            </button>
          ))}
        </div>
        <div key={selected} role="tabpanel" id={'panel-' + selected} aria-labelledby={'tab-' + selected} className="theory" style={{ '--c': topic.color }}>
          <div className="dpan"><Diagram kind={selected} /></div>
          <div className="tlist">
            {topic.cards.map((card, i) => (
              <div className={'titem' + (card.kind ? ' rich ' + card.kind : '')} key={card.title} style={{ '--i': i }}>
                <h3>{card.title}</h3><CardBody card={card} topic={topic} />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div></section>
  )
}
