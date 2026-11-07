import Reveal from './Reveal.jsx'

/** Section heading: small colored tag, title and optional lead paragraph. */
export default function SectionHead({ tag, title, lead }) {
  return (
    <Reveal>
      <span className="tag">{tag}</span>
      <h2>{title}</h2>
      {lead && <p className="lead">{lead}</p>}
    </Reveal>
  )
}
