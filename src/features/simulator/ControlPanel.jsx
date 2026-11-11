import Icon from '../../components/Icon.jsx'
import { Select, Toggle } from '../../components/ui'
import { MEDIA } from '../../domain/media.js'
import { colorNameForWavelength, wavelengthToCss } from '../../domain/spectrum.js'
import { SCENARIOS } from './scenarios.js'

const QUICK_ANGLES = [0, 30, 45, 60, 75]

const MediumSelect = ({ id, label, value, onChange }) => (
  <div>
    <label htmlFor={id}>{label}</label>
    <Select id={id} value={value} onChange={onChange} options={MEDIA.map((medium, i) => ({ value: i, label: medium.name, detail: 'n = ' + String(medium.index).replace('.', ',') }))} />
  </div>
)

/**
 * Right-hand column of the simulator: preset cases, angle and color sliders, material selectors and view options.
 * `onUserChange(patch)` applies a manual change (clearing the active preset); `onPatch(patch)` changes without clearing it.
 */
export default function ControlPanel({ scene, activeScenario, playing, onScenario, onUserChange, onPatch, onAngleChange, onTogglePlay, onReset }) {
  const degrees = scene.incidentAngle.toFixed(1).replace('.', ',')
  return (
    <aside className="simR" aria-label="Controles del simulador">
      <h3 className="ch"><i>1</i>Elige un caso</h3>
      <div className="cases" role="group" aria-label="Casos listos">
        {SCENARIOS.map((scenario) => (
          <button key={scenario.id} type="button" aria-pressed={activeScenario === scenario.id} className={'case ' + (activeScenario === scenario.id ? 'on' : '')} onClick={() => onScenario(scenario)}>
            <Icon name={scenario.icon} size={20} /><span><b>{scenario.label}</b><small>{scenario.description}</small></span>
          </button>
        ))}
      </div>

      <h3 className="ch"><i>2</i>Ajusta la luz</h3>
      <div className="fld">
        <label htmlFor="ang">Ángulo con que llega <b>{degrees}°</b></label>
        <input id="ang" className="rng" type="range" min="0" max="89" step="0.5" value={scene.incidentAngle} onChange={(event) => onAngleChange(+event.target.value)} />
        <div className="quick">{QUICK_ANGLES.map((angle) => <button key={angle} type="button" className={'qk ' + (scene.incidentAngle === angle ? 'on' : '')} onClick={() => onAngleChange(angle)}>{angle}°</button>)}</div>
      </div>
      <div className="fld">
        <label htmlFor="lam">Color de la luz <b><span className="dot" style={{ background: wavelengthToCss(scene.wavelength) }} />{colorNameForWavelength(scene.wavelength)} · {scene.wavelength} nm</b></label>
        <input id="lam" className="rng spec" type="range" min="400" max="700" step="5" value={scene.wavelength} onChange={(event) => onPatch({ wavelength: +event.target.value })} />
      </div>

      <h3 className="ch"><i>3</i>Cambia los materiales</h3>
      <div className="mats">
        <MediumSelect id="m1" label="La luz viene de" value={scene.firstMedium} onChange={(firstMedium) => onUserChange({ firstMedium })} />
        <button type="button" className="swap" onClick={() => onUserChange({ firstMedium: scene.secondMedium, secondMedium: scene.firstMedium })} aria-label="Intercambiar los dos materiales" title="Intercambiar"><Icon name="swap" size={20} /></button>
        <MediumSelect id="m2" label={scene.mode === 'slab' ? 'Material de la placa' : 'La luz entra a'} value={scene.secondMedium} onChange={(secondMedium) => onUserChange({ secondMedium })} />
      </div>
      <p className="note">«n» mide cuánto frena el material a la luz. Al pasar a un n mayor el rayo se acerca a la normal; a un n menor, se aleja (y puede haber reflexión total).</p>

      <div className="act">
        <button type="button" className="btn sm" onClick={onTogglePlay}><Icon name={playing ? 'pause' : 'play'} size={16} />{playing ? 'Detener' : 'Animar el ángulo'}</button>
        <button type="button" className="btn ghost sm" onClick={onReset}><Icon name="reset" size={16} />Reiniciar</button>
      </div>
      <details className="adv">
        <summary>Opciones de vista</summary>
        <div className="toggles">
          <Toggle on={scene.showNames} onChange={() => onPatch({ showNames: !scene.showNames })}>Nombres de los rayos</Toggle>
          <Toggle on={scene.showArcs} onChange={() => onPatch({ showArcs: !scene.showArcs })}>Medidas de los ángulos</Toggle>
          <Toggle on={scene.showProtractor} onChange={() => onPatch({ showProtractor: !scene.showProtractor })}>Transportador</Toggle>
          <Toggle on={scene.mode === 'slab'} onChange={() => onUserChange({ mode: scene.mode === 'slab' ? 'interface' : 'slab' })}>Placa de caras paralelas</Toggle>
          <Toggle on={scene.dispersion} onChange={() => onPatch({ dispersion: !scene.dispersion })}>Dispersión por color</Toggle>
        </div>
      </details>
    </aside>
  )
}
