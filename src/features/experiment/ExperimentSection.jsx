import { SectionHead, Reveal } from '../../components/ui'
import ToolGuide from '../../components/ToolGuide.jsx'
import { EXPERIMENT_MATERIALS } from '../../content/experiment.js'
import { TOOLS } from '../../content/tools.js'
import { EXPERIMENT_ANGLES, buildResultRows } from '../../domain/experiment.js'
import { INDEX } from '../../domain/media.js'
import { useStoredState } from '../../hooks/useStoredState.js'
import SetupLab from './SetupLab.jsx'
import PhotoGallery from './PhotoGallery.jsx'
import ResultsTable from './ResultsTable.jsx'
import StepChecklist from './StepChecklist.jsx'
import VirtualLab from './VirtualLab.jsx'

const emptyReadings = () => EXPERIMENT_ANGLES.map(() => '')

/** Experiment section: the group's setup (watch), the virtual practice (measure), then the real water experiment (materials, results, photos, steps). */
export default function ExperimentSection() {
  const [doneSteps, setDoneSteps] = useStoredState('luz.steps', [])
  const [readings, setReadings] = useStoredState('luz.meas', emptyReadings())
  const rows = buildResultRows(readings)

  const toggleStep = (i) => setDoneSteps((done) => (done.includes(i) ? done.filter((step) => step !== i) : [...done, i]))
  const setReading = (i, text) => setReadings((all) => all.map((reading, j) => (j === i ? text : reading)))

  return (
    <section id="experimento"><div className="wrap">
      <SectionHead tag="Experimento" title="Midiendo la refracción en agua" lead={`Objetivo: ver con un láser verde y agua con un poco de leche que la luz se refracta al entrar al agua (n = ${INDEX.water}) y que otra parte se refleja. Marca cada paso al completarlo; tu progreso se guarda.`} />
      <ToolGuide tools={TOOLS} active="montaje" />
      <SetupLab />
      <ToolGuide tools={TOOLS} active="practica" />
      <VirtualLab />
      <h3 className="xh">Ahora hazlo de verdad</h3>
      <div className="two">
        <Reveal>
          <div className="card" style={{ marginBottom: 18 }}>
            <h3>Materiales</h3>
            <div className="chips">{EXPERIMENT_MATERIALS.map((material) => <span className="chip" key={material}>{material}</span>)}</div>
          </div>
          <ResultsTable rows={rows} readings={readings} onReadingChange={setReading} onClear={() => setReadings(emptyReadings())} />
          <PhotoGallery />
        </Reveal>
        <Reveal delay={0.1}>
          <StepChecklist done={doneSteps} onToggle={toggleStep} onReset={() => setDoneSteps([])} />
        </Reveal>
      </div>
    </div></section>
  )
}
