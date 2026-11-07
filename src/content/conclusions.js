// Conclusions. `diagram` is the theory topic index drawn next to the text (null = show the lab-accuracy badge).

export const CONCLUSIONS = [
  {
    title: 'Reflexión',
    color: '#ffb347',
    diagram: 0,
    formula: 'θᵢ = θᵣ',
    text: 'La reflexión cumple θᵢ = θᵣ en cualquier superficie lisa, sin importar los medios.',
  },
  {
    title: 'Refracción',
    color: '#4de3ff',
    diagram: 1,
    formula: 'n₁ · sen θ₁ = n₂ · sen θ₂',
    text: 'La refracción obedece la ley de Snell: al pasar a un medio más denso el rayo se acerca a la normal, y al pasar a uno menos denso se aleja.',
  },
  {
    title: 'Reflexión total interna',
    color: '#a98bff',
    diagram: 2,
    formula: 'θc = arcsen(n₂ ÷ n₁),  n₁ > n₂',
    text: 'La reflexión total interna solo ocurre de un medio más denso a uno menos denso y a partir del ángulo crítico.',
  },
  {
    title: 'Laboratorio',
    color: '#3fe3a0',
    diagram: null,
    formula: 'error % = |n medido − n real| ÷ n real × 100',
    text: 'Los valores medidos en el laboratorio se acercan a los teóricos; las diferencias vienen de la lectura del transportador y del ancho del haz.',
  },
]

export const CONCLUSIONS_KEY_IDEA = 'La luz cambia de dirección porque cambia de velocidad al pasar de un medio a otro (n = c ÷ v): un mayor n frena más la luz y la dobla más.'
