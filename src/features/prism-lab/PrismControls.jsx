import Icon from '../../components/Icon.jsx'
import { Select } from '../../components/ui'
import { PRISM_MATERIALS } from '../../domain/media.js'
import { wavelengthToCss } from '../../domain/spectrum.js'
import { SPECTRUM_CHIPS } from '../../content/prismLab.js'

/** Readout of the selected color: index, exit angle and total deviation (from a wavelength trace). */
export function PrismReadout({ settings, selectedWavelength, trace, recombines }) {
  const leaves = trace.exitAngle != null, label = SPECTRUM_CHIPS.find((chip) => chip.wavelength === selectedWavelength)?.label
  return (
    <div className="pinfo" role="status" aria-live="polite">
      <strong style={{ color: wavelengthToCss(selectedWavelength) }}>{label} · {selectedWavelength} nm</strong>
      <span>Índice de refracción: <b>{trace.index.toFixed(3).replace('.', ',')}</b></span>
      <span>Ángulo de salida: <b>{leaves ? trace.exitAngle.toFixed(1).replace('.', ',') + '°' : 'no sale (rebota)'}</b></span>
      <span>Desvío total: <b>{leaves ? Math.abs(trace.deviation).toFixed(1).replace('.', ',') + '°' : '—'}</b></span>
      {settings.newtonPair && <span className="pnote">{recombines ? 'Con dos prismas los colores salen paralelos y se juntan: luz blanca otra vez.' : 'Gira un prisma con el mouse o el dedo hasta que los colores salgan paralelos.'}</span>}
    </div>
  )
}

const Slider = ({ id, label, value, display = value, ...range }) => (
  <div><label htmlFor={id}>{label} <b>{display}</b></label><input id={id} className="rng" type="range" value={value} {...range} /></div>
)

/** Material, geometry and light controls of the prism lab. */
export function PrismControls({ settings, onChange, onWavelength, onReset }) {
  return (
    <>
      <div className="pfields">
        <div>
          <label htmlFor="pm">Material</label>
          <Select id="pm" value={settings.material} onChange={(material) => onChange({ material })}
            options={PRISM_MATERIALS.map((material, i) => ({ value: i, label: material.name, detail: 'n = ' + String(material.index).replace('.', ',') }))} />
        </div>
        <Slider id="pa" label="Ángulo del vértice" display={settings.apexAngle + '°'} min="30" max="75" step="1" value={settings.apexAngle} onChange={(event) => onChange({ apexAngle: +event.target.value })} />
        <Slider id="pr" label="Giro del prisma" display={settings.rotation + '°'} min="-60" max="60" step="0.5" value={Math.max(-60, Math.min(60, settings.rotation))} onChange={(event) => onChange({ rotation: +event.target.value })} />
        <Slider id="pl" label="Altura del láser" min="30" max="430" step="1" value={settings.laserY} onChange={(event) => onChange({ laserY: +event.target.value })} />
        {!settings.whiteLight && (
          <div><label htmlFor="pw">Color de la luz <b>{settings.wavelength} nm</b></label>
            <input id="pw" className="rng spec" type="range" min="400" max="700" step="5" value={settings.wavelength} onChange={(event) => onWavelength(+event.target.value)} /></div>
        )}
      </div>
      <div className="ptog">
        <button type="button" role="switch" aria-checked={settings.whiteLight} className={'tg ' + (settings.whiteLight ? 'on' : '')} onClick={() => onChange({ whiteLight: !settings.whiteLight })}><i className="sw" aria-hidden="true" />{settings.whiteLight ? 'Luz blanca' : 'Luz de un solo color'}</button>
        <button type="button" role="switch" aria-checked={settings.newtonPair} className={'tg ' + (settings.newtonPair ? 'on' : '')} onClick={() => onChange({ newtonPair: !settings.newtonPair, prismHidden: false })}><i className="sw" aria-hidden="true" />Experimento de Newton</button>
        <button type="button" className="btn ghost sm" onClick={onReset}><Icon name="reset" size={16} />Reiniciar</button>
      </div>
    </>
  )
}
