import { Reveal, SectionHead } from '../../components/ui'
import Icon from '../../components/Icon.jsx'
import { COMPARISON_HEADS, COMPARISON_ROWS, QUICK_SUMMARY } from '../../content/comparison.js'
import NormalTip from './NormalTip.jsx'

/** Side-by-side cell: optional yes/no chip, the text and an optional equation. */
function Cell({ cell, head }) {
  const detail = cell.flag ? cell.text.replace(/^(Sí|No),?\s*/, '') : cell.text   // the chip already says yes / no
  return (
    <div className="cmp-cell" style={{ '--c': head.color }} data-col={head.label}>
      {cell.flag && <span className={'cmp-flag ' + cell.flag}><Icon name={cell.flag === 'yes' ? 'check' : 'x'} size={14} />{cell.flag === 'yes' ? 'Sí' : 'No'}</span>}
      {detail && <span>{detail}</span>}
      {cell.math && <span className="eq">{cell.math}</span>}
    </div>
  )
}

/** Comparison table, quick summary and the "measure from the normal" reminder. In presentation mode each block appears on a click. */
export default function ComparisonSection() {
  return (
    <section id="comparacion"><div className="wrap">
      <SectionHead tag="Comparación" title="Reflexión frente a refracción" lead="Dos formas en que la luz responde a una frontera. Compáralas fila por fila." />
      <div className="cmp" role="table" aria-label="Comparación entre reflexión y refracción">
        <Reveal>
          <div className="cmp-row cmp-heads">
            <span />
            {COMPARISON_HEADS.map((head) => <div key={head.id} className="cmp-th" style={{ '--c': head.color }}>{head.label}</div>)}
          </div>
        </Reveal>
        {COMPARISON_ROWS.map((row, i) => (
          <Reveal key={row.question} delay={i*0.05}>
            <div className="cmp-row">
              <div className="cmp-q">{row.question}</div>
              {row.cells.map((cell, j) => <Cell key={j} cell={cell} head={COMPARISON_HEADS[j]} />)}
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <h3 className="cmp-title">Resumen rápido</h3>
        <div className="cmp-sum">
          {QUICK_SUMMARY.map((item) => (
            <article key={item.tag} className="cmp-card" style={{ '--c': item.color }}>
              <span className="cmp-tag">{item.tag}</span>
              <p>{item.text}</p>
              {item.math && <span className="eq">{item.math}</span>}
            </article>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <div className="cmp-tip">
          <div className="cmp-tipfig"><NormalTip /></div>
          <div>
            <span className="cmp-tag err">No lo olvides</span>
            <h3>Los ángulos se miden desde la normal, no desde la superficie</h3>
            <p>Si un rayo forma 35° con el espejo, el ángulo de incidencia no es 35°: es 90° − 35° = 55°. Lo mismo vale para la refracción.</p>
          </div>
        </div>
      </Reveal>
    </div></section>
  )
}
