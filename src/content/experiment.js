// Content of the real experiment: a 2 L container with water and a little milk, lit by a green laser.

export const EXPERIMENT_STEPS = [
  { title: 'Prepara el recipiente', text: 'Usa un recipiente transparente de 2 litros sobre una hoja blanca, con la normal y los ángulos dibujados.' },
  { title: 'Llénalo con agua', text: 'Agrega entre 1,8 y 2 litros de agua, casi hasta el borde y sin que se derrame.' },
  { title: 'Agrega la leche', text: 'Pon entre 3 y 6 mL de leche (una cucharadita rasa son unos 5 mL) y revuelve despacio. Con menos, el haz no se ve; con más, el agua se pone turbia.' },
  { title: 'Oscurece el lugar', text: 'Apaga las luces y apunta el láser verde a la superficie del agua. Nunca lo dirijas a los ojos de nadie.' },
  { title: 'Observa la refracción', text: 'El haz se dobla al entrar al agua y se acerca a la normal. Mide θ₂ con el transportador para varios θ₁.' },
  { title: 'Observa la reflexión', text: 'Parte de la luz rebota en la superficie: es el rayo débil que sale hacia arriba. Comprueba que θᵢ = θᵣ.' },
  { title: 'Compara y concluye', text: 'Calcula n con la ley de Snell, obtén el error porcentual y explica las diferencias con el valor teórico.' },
]

export const EXPERIMENT_MATERIALS = ['Recipiente transparente de 2 L', 'Agua (1,8 a 2 L)', 'Leche (3 a 6 mL)', 'Puntero láser verde', 'Jeringa o cuchara medidora', 'Transportador', 'Hoja blanca', 'Regla']

// Why each ingredient is there, shown next to the animated setup.
export const SETUP_REASONS = [
  { title: 'Agua', color: '#4de3ff', text: 'Es el segundo medio: n ≈ 1,33. Al entrar, la luz se frena y se acerca a la normal.' },
  { title: 'Leche', color: '#ffffff', text: 'Sus gotitas dispersan la luz y dejan ver el haz por dentro. No cambia el índice del agua: 3 a 6 mL en 2 L es muy poco.' },
  { title: 'Láser verde', color: '#3dff7a', text: 'Es un haz fino y muy brillante, fácil de ver y de medir. Su luz es de un solo color, así que casi no se dispersa.' },
  { title: 'Reflexión', color: '#ffb347', text: 'En la superficie, una parte pequeña de la luz rebota con θᵣ = θᵢ. Cuanto más inclinado el láser, más rebota.' },
]

export const SETUP_STATUS = {
  faint: { tone: 'warn', text: 'Con tan poca leche el haz casi no se ve dentro del agua. Agrega más: de 3 a 6 mL.' },
  ideal: { tone: 'ok', text: 'Perfecto: el haz verde se ve claro dentro del agua y todavía se distingue el rayo reflejado.' },
  cloudy: { tone: 'bad', text: 'Demasiada leche: el agua se vuelve turbia y el haz se difumina y se apaga pronto. Quédate entre 3 y 6 mL.' },
}
