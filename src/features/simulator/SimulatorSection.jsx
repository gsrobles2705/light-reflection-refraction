import { useMemo, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import ToolGuide from '../../components/ToolGuide.jsx'
import { Reveal, SectionHead } from '../../components/ui'
import { TOOLS } from '../../content/tools.js'
import { useCanvasPalette } from '../../hooks/useCanvasPalette.js'
import ControlPanel from './ControlPanel.jsx'
import { buildSimulatorModel, DEFAULT_SCENE } from '../../rendering/simulatorModel.js'
import Readouts from './Readouts.jsx'
import SimulatorCanvas from './SimulatorCanvas.jsx'
import { useAngleSweep } from './useAngleSweep.js'

/**
 * Light lab: state owner of the simulator. The physics/layout is derived from the scene (`buildSimulatorModel`);
 * the canvas, readouts and control panel are presentational pieces that receive the scene and report changes.
 */
export default function SimulatorSection({ theme }) {
  const [scene, setScene] = useState(DEFAULT_SCENE)
  const [playing, setPlaying] = useState(false)
  const [activeScenario, setActiveScenario] = useState('')
  const [touched, setTouched] = useState(false)   // hides the "drag the laser" hint after the first interaction
  const paletteRef = useCanvasPalette(theme)

  const model = useMemo(() => buildSimulatorModel(scene), [scene.firstMedium, scene.secondMedium, scene.incidentAngle, scene.wavelength, scene.mode, scene.dispersion])

  const patchScene = (patch) => setScene((current) => ({ ...current, ...patch }))
  /** A change made by the user: it no longer matches the selected preset. */
  const changeByUser = (patch) => { setActiveScenario(''); setTouched(true); patchScene(patch) }
  const changeAngle = (incidentAngle) => { setPlaying(false); changeByUser({ incidentAngle }) }
  const selectScenario = (scenario) => { setPlaying(false); setActiveScenario(scenario.id); setTouched(true); patchScene(scenario.apply(scene)) }
  const reset = () => { setPlaying(false); setActiveScenario(''); setTouched(false); setScene(DEFAULT_SCENE) }

  useAngleSweep({ playing, angle: scene.incidentAngle, onAngle: (incidentAngle) => patchScene({ incidentAngle }) })

  return (
    <section id="simulador" className="alt"><div className="wrap">
      <SectionHead tag="Simulador" title="Laboratorio de luz" lead="Tu espacio libre para experimentar: mueve el láser, cambia los materiales y mira cómo se dobla, rebota o se atrapa la luz. Todo se explica solo, sin fórmulas." />
      <Reveal>
        <ToolGuide tools={TOOLS} active="laboratorio" />
        <ol className="howto">
          <li><Icon name="cursor" /><span><b>Mueve el láser</b> arrastrándolo sobre el dibujo.</span></li>
          <li><Icon name="drop" /><span><b>Cambia los materiales</b> o elige un caso listo.</span></li>
          <li><Icon name="check" /><span><b>Lee el resultado</b> en palabras simples.</span></li>
        </ol>
        <div className="sim sim2">
          <div className="simL">
            <SimulatorCanvas scene={scene} model={model} paletteRef={paletteRef} hintVisible={!touched} onAngleChange={changeAngle} onUserInteract={changeByUser} />
            <Readouts scene={scene} model={model} />
          </div>
          <ControlPanel scene={scene} activeScenario={activeScenario} playing={playing} onScenario={selectScenario} onUserChange={changeByUser} onPatch={patchScene}
            onAngleChange={changeAngle} onTogglePlay={() => setPlaying((value) => !value)} onReset={reset} />
        </div>
      </Reveal>
    </div></section>
  )
}
