import { useState } from 'react'
import { NumberField } from '../../components/ui'
import { averageIndex, toCsv, toTsv } from '../../domain/experiment.js'
import { INDEX } from '../../domain/media.js'
import { copyText, downloadText } from '../../lib/clipboard.js'

const ACCEPTABLE_ERROR_PERCENT = 5

/** Measurements table: the student types the refracted angles; n and the error are computed live. */
export default function ResultsTable({ rows, readings, onReadingChange, onClear }) {
  const [message, setMessage] = useState('')
  const average = averageIndex(rows)
  const flash = (text) => { setMessage(text); setTimeout(() => setMessage(''), 2000) }

  const copy = async () => flash((await copyText(toTsv(rows))) ? 'Tabla copiada' : 'No se pudo copiar')
  const download = () => { if (!downloadText(toCsv(rows), 'resultados-refraccion.csv', 'text/csv')) flash('No se pudo descargar') }

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h3>Resultados</h3>
      <div className="tw"><table>
        <thead><tr>
          <th title="Ángulo con que entra el láser, medido desde la normal">θ₁ aire</th>
          <th title="Ángulo que debería salir según la ley de Snell">θ₂ teórico</th>
          <th title="El ángulo que mediste tú con el transportador">θ₂ medido</th>
          <th title="Índice de refracción calculado con tu medida">n</th>
          <th title="Qué tan lejos quedó tu n del valor real">Error</th>
        </tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={row.incident}>
            <td>{row.incident}°</td><td>{row.expected.toFixed(1)}°</td>
            <td><NumberField suffix="°" className="sm" label={`Ángulo refractado medido para ${row.incident} grados`} placeholder="0.0" value={readings[i]} onChange={(event) => onReadingChange(i, event.target.value)} /></td>
            <td>{row.index ? row.index.toFixed(3) : '—'}</td>
            <td className={row.errorPercent == null ? '' : row.errorPercent > ACCEPTABLE_ERROR_PERCENT ? 'bad' : 'good'}>{row.errorPercent != null ? row.errorPercent.toFixed(1) + '%' : '—'}</td>
          </tr>
        ))}</tbody>
      </table></div>
      <p className="tlegend"><b>n</b> dice qué tan lento va la luz en el agua: n = sen θ₁ ÷ sen θ₂. <b>Error</b> dice cuánto se equivocó tu medida (en %); menos de 5 % es una buena medida.</p>
      <p className="res" aria-live="polite">{average ? <>n promedio medido = <b>{average.toFixed(3)}</b> (teórico {INDEX.water})</> : 'Ingresa tus ángulos medidos para calcular n.'}</p>
      <div className="row">
        <button className="btn ghost sm" onClick={copy}>Copiar tabla</button>
        <button className="btn ghost sm" onClick={download}>Descargar CSV</button>
        <button className="btn ghost sm" onClick={onClear}>Limpiar</button>
        <span className="ok-msg" role="status">{message}</span>
      </div>
    </div>
  )
}
