// Reflection versus refraction: comparison table and quick summary.

export const COMPARISON_HEADS = [
  { id: 'reflexion', label: 'Reflexión', color: '#ffb347' },
  { id: 'refraccion', label: 'Refracción', color: '#4de3ff' },
]

/** One row per question; `flag` marks yes/no answers and `math` an equation shown as a badge. */
export const COMPARISON_ROWS = [
  { question: '¿Qué pasa?', cells: [{ text: 'La luz rebota' }, { text: 'La luz cambia de dirección al pasar a otro medio' }] },
  { question: '¿Cambia de medio?', cells: [{ text: 'No, regresa al mismo medio', flag: 'no' }, { text: 'Sí', flag: 'yes' }] },
  { question: '¿Cambia la velocidad?', cells: [{ text: 'No', flag: 'no' }, { text: 'Sí', flag: 'yes' }] },
  { question: 'Ley principal', cells: [{ text: 'Ángulos iguales', math: 'θᵢ = θᵣ' }, { text: 'Ley de Snell', math: 'n₁ sen θ₁ = n₂ sen θ₂' }] },
  { question: 'Ejemplo', cells: [{ text: 'Un espejo' }, { text: 'Un lápiz en un vaso con agua' }] },
]

export const QUICK_SUMMARY = [
  { topic: 'reflexion', tag: 'Reflexión', color: '#ffb347', text: 'La luz rebota y se cumple que el ángulo de incidencia es igual al de reflexión.', math: 'θᵢ = θᵣ' },
  { topic: 'refraccion', tag: 'Refracción', color: '#4de3ff', text: 'La luz cambia de dirección al cambiar de medio, porque cambia su velocidad.' },
  { topic: 'refraccion', tag: 'Densidad', color: '#a98bff', text: 'En un medio más denso se acerca a la normal; en uno menos denso, se aleja.' },
]
