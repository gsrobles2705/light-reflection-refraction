import { useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { Reveal, SectionHead } from '../../components/ui'
import { citationOf, REFERENCE_GROUPS, REFERENCES } from '../../content/references.js'
import { copyText } from '../../lib/clipboard.js'

/** One source: type, title, authors, publisher, what it is good for, and actions (open link / copy citation). */
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
      <SectionHead tag="Referencias" title="Fuentes consultadas" lead="Libros de texto y recursos en línea que respaldan la teoría, las fórmulas y las simulaciones de esta página." />
      <Reveal>
        <div className="refg">
          {REFERENCE_GROUPS.map((group) => (
            <div key={group.id}>
              <h3 className="refh"><Icon name={group.icon} size={18} />{group.title}</h3>
              <ul className="refl">
                {REFERENCES.filter((reference) => reference.kind === group.id).map((reference) => <ReferenceCard key={reference.title} reference={reference} />)}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>
    </div></section>
  )
}
