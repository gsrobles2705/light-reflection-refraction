import { useMemo, useRef, useState } from 'react'
import { Reveal, SectionHead } from '../../components/ui'
import { PRISM_STORY, SPECTRUM_CHIPS } from '../../content/prismLab.js'
import { PRISM_MATERIALS } from '../../domain/media.js'
import { buildPrismGeometry, colorsRecombine, DEFAULT_PRISM_SETTINGS, findComfortableRotation, traceWavelength } from '../../domain/prism.js'
import { wavelengthToCss } from '../../domain/spectrum.js'
import PrismCanvas from './PrismCanvas.jsx'
import { PrismControls, PrismReadout } from './PrismControls.jsx'
import { usePrismScrollStory } from './usePrismScrollStory.js'

const MANUAL_STEP = -2   // no guided step is active: the user took control
const DEFAULT_SELECTED_WAVELENGTH = 530

/** Settings for a story step; `rotation: 'min'` asks the tracer for a comfortable rotation. */
function settingsForStep(index) {
  const settings = { ...DEFAULT_PRISM_SETTINGS, ...PRISM_STORY[index].settings }
  return settings.rotation === 'min' ? { ...settings, rotation: findComfortableRotation(settings) } : settings
}

/**
 * Prism lab. A sticky canvas on one side and a scroll-driven story on the other: the settings follow the story step
 * being read, and the user can take over at any time with the controls or by dragging in the canvas.
 */
export default function PrismLabSection() {
  const [settings, setSettings] = useState(DEFAULT_PRISM_SETTINGS)
  const [selectedWavelength, setSelectedWavelength] = useState(DEFAULT_SELECTED_WAVELENGTH)
  const [step, setStep] = useState(-1)
  const sectionRef = useRef(), stepRefs = useRef([])

  const patch = (changes) => setSettings((current) => ({ ...current, ...changes }))
  const geometry = useMemo(() => buildPrismGeometry(settings), [settings.apexAngle, settings.rotation, settings.newtonPair, settings.pairGap])
  const trace = traceWavelength(settings, selectedWavelength, geometry)
  const recombines = settings.newtonPair && colorsRecombine(settings, geometry)

  usePrismScrollStory({ sectionRef, stepRefs, onStepChange: (index) => { setStep(index); setSettings(settingsForStep(index)) } })

  const selectColor = (wavelength) => { setSelectedWavelength(wavelength); if (!settings.whiteLight) patch({ wavelength }) }
  const reset = () => { setStep(MANUAL_STEP); setSettings(DEFAULT_PRISM_SETTINGS) }

  return (
    <section id="prisma" ref={sectionRef}><div className="wrap pwide">
      <SectionHead tag="Prisma" title="El prisma que descompone la luz" lead="Gira el prisma, mueve el láser y toca un color. Todo lo que ves usa la ley de Snell en cada cara del vidrio." />
      <div className="pgrid">
        <div className="pstick">
          <PrismCanvas settings={settings} selectedWavelength={selectedWavelength} materialName={PRISM_MATERIALS[settings.material].name} onChange={patch} onDragStart={() => setStep(MANUAL_STEP)} />
          <div className="pcolors" role="group" aria-label="Elige un color para ver sus datos">
            {SPECTRUM_CHIPS.map(({ wavelength, label }) => (
              <button key={wavelength} type="button" aria-pressed={selectedWavelength === wavelength} className={selectedWavelength === wavelength ? 'on' : ''} style={{ '--k': wavelengthToCss(wavelength) }} onClick={() => selectColor(wavelength)}><i />{label}</button>
            ))}
          </div>
        </div>
        <ol className="psteps">
          {PRISM_STORY.map((item, i) => (
            <li key={i} ref={(element) => (stepRefs.current[i] = element)} data-i={i} className={step === i ? 'on' : ''}>
              <span className="pn" aria-hidden="true">{i + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div>
            </li>
          ))}
          <li className="pfree"><div><h3>Ahora te toca a ti</h3><p>Usa los controles de abajo o arrastra directamente en el dibujo.</p></div></li>
        </ol>
      </div>
      <Reveal><div className="pctl">
        <PrismReadout settings={settings} selectedWavelength={selectedWavelength} trace={trace} recombines={recombines} />
        <PrismControls settings={settings} onChange={patch} onWavelength={(wavelength) => { patch({ wavelength }); setSelectedWavelength(wavelength) }} onReset={reset} />
        <p className="note">El violeta se frena más en el vidrio que el rojo, por eso se desvía más y los colores se separan. El abanico se dibuja ampliado para distinguir los colores: el modelo de dispersión es simplificado y los valores son aproximados.</p>
      </div></Reveal>
    </div></section>
  )
}
