import { useState } from 'react'
import { INDEX, MEDIA } from '../../domain/media.js'
import { gradeMysteryChoice, gradeReading, interpretReading, pickRandom, trueRefractedAngle, TRAINING_ANGLES } from '../../domain/virtualLab.js'

/** Materials the mystery mode can pick from; their indices are well separated (1.33 · 1.52 · 2.42). */
export const MYSTERY_MATERIALS = MEDIA.filter((medium) => ['water', 'glass', 'diamond'].includes(medium.id))
const WATER = MEDIA.find((medium) => medium.id === 'water')
const DEFAULT_ANGLE = { water: 40, mystery: 50 }

/**
 * State and rules of the virtual lab. The student reads θ₂ on a protractor and types it; grading rules live in
 * domain/virtualLab.js, this hook only wires them to React state.
 *
 * @returns {object} derived values for the view plus the actions `switchMode`, `setIncident`, `setGuess`, `check`, `choose`, `retry`
 */
export function useVirtualLab() {
  const [mode, setMode] = useState('water')            // 'water' | 'mystery'
  const [incident, setIncidentAngle] = useState(DEFAULT_ANGLE.water)
  const [guess, setGuessText] = useState('')
  const [result, setResult] = useState(null)           // { correct, text } once the attempt is graded
  const [secret, setSecret] = useState(() => pickRandom(MYSTERY_MATERIALS))
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const material = mode === 'water' ? WATER : secret
  const trueAngle = trueRefractedAngle(incident, material)
  const { reading, measuredIndex } = interpretReading(guess, incident)

  const clearAttempt = () => { setGuessText(''); setResult(null) }
  const finish = (correct, text) => {
    setResult({ correct, text })
    setScore((current) => ({ correct: current.correct + (correct ? 1 : 0), total: current.total + 1 }))
  }

  return {
    mode, incident, guess, result, score, material, trueAngle, reading, measuredIndex,
    airIndex: INDEX.air,
    switchMode(nextMode) {
      setMode(nextMode)
      setIncidentAngle(DEFAULT_ANGLE[nextMode])
      clearAttempt()
      if (nextMode === 'mystery') setSecret(pickRandom(MYSTERY_MATERIALS))
    },
    setIncident(angle) { setIncidentAngle(angle); clearAttempt() },
    setGuess: setGuessText,
    /** Water mode: grade the typed reading against the true refracted angle. */
    check() {
      if (result || !measuredIndex) return
      const graded = gradeReading({ incidentDegrees: incident, reading, measuredIndex, material })
      finish(graded.correct, graded.correct
        ? `¡Muy bien! El rayo marca ${graded.trueAngle.toFixed(1).replace('.', ',')}°. Con tu medida, n = ${measuredIndex.toFixed(3).replace('.', ',')} (el real es ${material.index}). Tu error: ${graded.errorPercent.toFixed(1).replace('.', ',')} %.`
        : `Casi. El rayo marca ${graded.trueAngle.toFixed(1).replace('.', ',')}° y tú pusiste ${reading}°. Recuerda: mide desde la línea punteada vertical hasta el rayo dentro del material.`)
    },
    /** Mystery mode: the student names the material after computing n. */
    choose(chosen) {
      if (result) return
      const graded = gradeMysteryChoice({ incidentDegrees: incident, reading, measuredIndex, secret, chosen })
      if (!graded.measurementIsClose) return finish(false, `Tu medida de θ₂ quedó lejos (n = ${measuredIndex.toFixed(3).replace('.', ',')}). Vuelve a leer el ángulo en el transportador y prueba de nuevo.`)
      finish(graded.correct, graded.correct
        ? `¡Correcto! Era ${chosen.name} (n = ${chosen.index}). Tu n medido: ${measuredIndex.toFixed(3).replace('.', ',')}, con un error de ${graded.errorPercent.toFixed(1).replace('.', ',')} %.`
        : `No era ${chosen.name}. Tu n = ${measuredIndex.toFixed(3).replace('.', ',')} y el material era ${secret.name} (n = ${secret.index}).`)
    },
    retry() {
      clearAttempt()
      if (mode === 'mystery') setSecret(pickRandom(MYSTERY_MATERIALS))
      setIncidentAngle(pickRandom(TRAINING_ANGLES[mode]))
    },
  }
}
