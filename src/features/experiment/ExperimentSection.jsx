import { SectionHead } from '../../components/ui'
import ToolGuide from '../../components/ToolGuide.jsx'
import { TOOLS } from '../../content/tools.js'
import { INDEX } from '../../domain/media.js'
import SetupLab from './SetupLab.jsx'
import VirtualLab from './VirtualLab.jsx'

const toolColor = Object.fromEntries(TOOLS.map((tool) => [tool.id, tool.color]))

/** Experiment section: the group's setup (watch) and the virtual practice (measure). */
export default function ExperimentSection() {
  return (
    <section id="experimento"><div className="wrap">
      <SectionHead tag="Experimento" title="Midiendo la refracción en agua" lead={`Objetivo: ver con un láser rojo y agua con un poco de leche que la luz se refracta al entrar al agua (n = ${INDEX.water}) y que otra parte se refleja. Marca cada paso al completarlo; tu progreso se guarda.`} />
      <div className="xband" style={{ '--sec': toolColor.montaje }}>
        <ToolGuide tools={TOOLS} active="montaje" />
        <SetupLab />
        <i className="xrib" aria-hidden="true" />
      </div>
      <div className="xband" style={{ '--sec': toolColor.practica }}>
        <ToolGuide tools={TOOLS} active="practica" />
        <VirtualLab />
        <i className="xrib" aria-hidden="true" />
      </div>
    </div></section>
  )
}
