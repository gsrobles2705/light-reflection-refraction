import { AnimatePresence, motion } from 'motion/react'
import { Reveal } from '../../components/ui'
import { VIRTUAL_LAB_CARDS } from '../../content/virtualLab.js'
import ProtractorFigure from './ProtractorFigure.jsx'
import { MYSTERY_MATERIALS, useVirtualLab } from './useVirtualLab.js'

/** Virtual lab: read θ₂ on a protractor, type it and get graded. Two modes: water and "mystery material". */
export default function VirtualLab() {
  const lab = useVirtualLab()
  const { mode, incident, guess, result, score, material, trueAngle, reading, measuredIndex } = lab
  const mystery = mode === 'mystery', answered = Boolean(result)

  return (
    <Reveal><div className="vlab">
      <p className="vkeys">Cuatro ideas que usarás al practicar</p>
      <div className="vcards">{VIRTUAL_LAB_CARDS.map(({ symbol, title, text, color }) => <div key={symbol} style={{ '--c': color }}><b>{symbol}</b><h4>{title}</h4><p>{text}</p></div>)}</div>
      <div className="vhead">
        <div className="vmode" role="group" aria-label="Modo">
          <button type="button" aria-pressed={!mystery} onClick={() => lab.switchMode('water')}>Agua</button>
          <button type="button" aria-pressed={mystery} onClick={() => lab.switchMode('mystery')}>Material misterioso</button>
        </div>
        <span className="vscore" aria-label="Puntaje">{score.correct} de {score.total} aciertos</span>
      </div>
      <div className="vgrid">
        <ProtractorFigure incident={incident} refracted={trueAngle} material={material} mystery={mystery} />
        <div className="vctl">
          <label htmlFor="vth">1. Elige θ₁ <b>{incident}°</b></label>
          <input id="vth" className="rng" type="range" min="10" max="80" step="5" value={incident} onChange={(event) => lab.setIncident(+event.target.value)} />
          <label htmlFor="vg">2. Lee θ₂ en el transportador (donde el rayo cruza el arco)</label>
          <div className="vin">
            <input id="vg" type="text" inputMode="decimal" autoComplete="off" placeholder="θ₂ en °" value={guess} disabled={answered}
              onChange={(event) => lab.setGuess(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && !mystery && lab.check()} />
            {!mystery && <button type="button" className="btn sm" onClick={lab.check} disabled={!measuredIndex || answered}>Comprobar</button>}
          </div>
          {guess !== '' && !measuredIndex && !answered && <p className="vn" role="alert">Escribe un número entre 2 y 89 (puedes usar punto o coma).</p>}
          {mystery && <>
            <p className="vn" aria-live="polite">{measuredIndex ? <>Tu n = sen {incident}° ÷ sen {reading}° = <b>{measuredIndex.toFixed(3)}</b>. ¿Qué material es?</> : '3. Con tu medida calculo n y tú adivinas el material.'}</p>
            <div className="vopts">{MYSTERY_MATERIALS.map((option) => <button key={option.id} type="button" className="btn ghost sm" disabled={!measuredIndex || answered} onClick={() => lab.choose(option)}>{option.name}</button>)}</div>
          </>}
          <AnimatePresence>{result && (
            <motion.div key="result" role="status" className={'vres ' + (result.correct ? 'ok' : 'no')} initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
              {result.text}
              <button type="button" className="btn sm" onClick={lab.retry}>Otro intento →</button>
            </motion.div>
          )}</AnimatePresence>
        </div>
      </div>
    </div></Reveal>
  )
}
