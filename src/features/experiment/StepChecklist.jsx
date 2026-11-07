import { motion } from 'motion/react'
import { EXPERIMENT_STEPS } from '../../content/experiment.js'

/** Experiment steps the student ticks off, with a progress bar. `done` is the list of completed step indices. */
export default function StepChecklist({ done, onToggle, onReset }) {
  const percent = Math.round((done.length / EXPERIMENT_STEPS.length) * 100)
  return (
    <>
      <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del experimento">
        <motion.div animate={{ width: percent + '%' }} /><span>{done.length} de {EXPERIMENT_STEPS.length} pasos</span>
      </div>
      <ol className="steps">
        {EXPERIMENT_STEPS.map(({ title, text }, i) => (
          <li key={title} className={done.includes(i) ? 'ok' : ''}>
            <button type="button" aria-pressed={done.includes(i)} onClick={() => onToggle(i)}><b>{title}</b><span>{text}</span></button>
          </li>
        ))}
      </ol>
      {done.length > 0 && <button className="btn ghost sm" onClick={onReset}>Reiniciar pasos</button>}
    </>
  )
}
