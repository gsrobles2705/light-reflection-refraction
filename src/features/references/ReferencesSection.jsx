import { useState } from 'react'
import { Reveal, SectionHead } from '../../components/ui'
import { citationOf, REFERENCES } from '../../content/references.js'
import { copyText } from '../../lib/clipboard.js'

/** One source: title, authors, publisher, what it is good for, and actions (open link / copy citation). */
function ReferenceCard({ reference }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!(await copyText(citationOf(reference)))) return
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <li className="refc">
      <h4>{reference.title}</h4>
      <p className="ref-by">{reference.authors} · {reference.publisher}</p>
      <p className="ref-top">{reference.topic}</p>
      <div className="ref-act">
        {reference.url && <a className="btn ghost sm" href={reference.url} target="_blank" rel="noopener noreferrer">Abrir sitio<span className="sr"> (se abre en una pestaña nueva)</span></a>}
        <button type="button" className="btn ghost sm" onClick={copy} aria-live="polite">{copied ? 'Cita copiada' : 'Copiar cita'}</button>
      </div>
    </li>
  )
}

export default function ReferencesSection() {
  return (
    <section id="referencias"><div className="wrap">
      <SectionHead tag="Referencias" title="Fuentes consultadas" lead="Fuentes en línea que respaldan la historia, la teoría, las fórmulas y las simulaciones de esta página." />
      <Reveal>
        <ul className="refl">
          {REFERENCES.map((reference) => <ReferenceCard key={reference.title} reference={reference} />)}
        </ul>
      </Reveal>
    </div></section>
  )
}
