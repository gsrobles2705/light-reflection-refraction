import { SPEED_OF_LIGHT } from '../../domain/constants.js'
import { explainScene } from './explanation.js'
import { SLAB_THICKNESS_CM } from '../../domain/interfaceModel.js'

const Stat = ({ label, value, sub, color }) => (
  <div className="stat"><span>{label}</span><strong style={color ? { color } : null}>{value}</strong>{sub && <em>{sub}</em>}</div>
)

/** Text outputs of the simulator: live explanation, main angle readouts and an expandable "more data" panel. */
export default function Readouts({ scene, model }) {
  const explanation = explainScene(scene, model), degrees = scene.incidentAngle.toFixed(1).replace('.', ',')
  const { n1, n2, totalInternalReflection, refractedDegrees, criticalDegrees, lateralShiftCm } = model
  const speed = (n) => (SPEED_OF_LIGHT / n / 1e8).toFixed(2).replace('.', ',')

  return (
    <>
      <div className="explain" role="status" aria-live="polite" style={{ '--sc': explanation.color }}>
        <strong>{explanation.title}</strong>
        <p>{explanation.text}</p>
      </div>
      <div className="read">
        <Stat label="Ángulo de llegada" value={degrees + '°'} sub="θ₁ · con la normal" color="var(--ray-t)" />
        <Stat label="Ángulo de rebote" value={degrees + '°'} sub="θ₁′ · siempre igual" color="var(--at)" />
        <Stat label="Ángulo al entrar" value={totalInternalReflection ? '—' : refractedDegrees.toFixed(1).replace('.', ',') + '°'} sub="θ₂ · en el 2.º material" color="var(--bt)" />
      </div>
      <details className="more">
        <summary>Más datos</summary>
        <div className="eqline">n₁·sen θ₁ = n₂·sen θ₂ → {n1.toFixed(3).replace('.', ',')}·sen({degrees}°) = {n2.toFixed(3).replace('.', ',')}·{totalInternalReflection ? <b style={{ color: 'var(--err)' }}>sen θ₂ &gt; 1 (imposible)</b> : <>sen({refractedDegrees.toFixed(1).replace('.', ',')}°)</>}</div>
        <div className="read">
          <Stat label="Cuánto se desvía" value={totalInternalReflection ? '—' : Math.abs(scene.incidentAngle - refractedDegrees).toFixed(1).replace('.', ',') + '°'} sub="diferencia entre θ₁ y θ₂" />
          <Stat label="Ángulo crítico" value={criticalDegrees ? criticalDegrees.toFixed(1).replace('.', ',') + '°' : 'No existe'} sub={criticalDegrees ? (scene.incidentAngle >= criticalDegrees ? 'superado' : 'aún no superado') : 'solo si n₁ > n₂'} />
          <Stat label="Velocidad de la luz" value={speed(n1) + ' → ' + speed(n2)} sub="×10⁸ m/s" />
          {lateralShiftCm != null && <Stat label="Desplazamiento lateral" value={lateralShiftCm.toFixed(2).replace('.', ',') + ' cm'} sub={`placa de ${SLAB_THICKNESS_CM} cm`} color="var(--bt)" />}
        </div>
        <p className="note">Con «Dispersión por color» activada, cada color se frena distinto: el azul se desvía más que el rojo.</p>
      </details>
    </>
  )
}
