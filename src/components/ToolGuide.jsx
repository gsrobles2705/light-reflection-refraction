/**
 * Strip that tells the reader which interactive tool is on screen and what it is for. It lists every tool (the current
 * one highlighted) so the three simulators are never confused. `tools` comes from the content layer.
 * @param {{ tools: { id: string, name: string, verb: string, color: string, use: string, not: string }[], active: string }} props
 */
export default function ToolGuide({ tools, active }) {
  const position = tools.findIndex((tool) => tool.id === active), current = tools[position]
  return (
    <div className="tguide" style={{ '--c': current.color }}>
      <span className="tguide-step">Herramienta {position + 1} de {tools.length}</span>
      <ol className="tguide-row" aria-label="Las tres herramientas interactivas">
        {tools.map((tool, i) => (
          <li key={tool.id} className={tool.id === active ? 'on' : ''} style={{ '--c': tool.color }} aria-current={tool.id === active ? 'step' : undefined}>
            <i aria-hidden="true">{i + 1}</i><span><b>{tool.name}</b><small>{tool.verb}</small></span>
          </li>
        ))}
      </ol>
      <p className="tguide-use"><b>Sirve para:</b> {current.use}</p>
      <p className="tguide-not"><b>No sirve para:</b> {current.not}</p>
    </div>
  )
}
