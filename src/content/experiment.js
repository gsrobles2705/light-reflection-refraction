// Content of the group's setup (a 2 L container with water and a little milk, lit by a red laser).

// Why each ingredient is there, shown next to the animated setup.
export const SETUP_REASONS = [
  { title: 'Agua', color: '#4de3ff', text: 'Es el segundo medio: n ≈ 1,33. Al entrar, la luz se frena y se acerca a la normal.' },
  { title: 'Leche', color: '#ffffff', text: 'Sus gotitas dispersan la luz y dejan ver el haz por dentro. No cambia el índice del agua: 3 a 6 mL en 2 L es muy poco.' },
  { title: 'Láser rojo', color: '#ff4d4d', text: 'Es un haz fino y muy brillante, fácil de ver y de medir. Su luz es de un solo color, así que casi no se dispersa.' },
  { title: 'Reflexión', color: '#ffb347', text: 'En la superficie, una parte pequeña de la luz rebota con θᵣ = θᵢ. Cuanto más inclinado el láser, más rebota.' },
]

export const SETUP_STATUS = {
  faint: { tone: 'warn', text: 'Con tan poca leche el haz casi no se ve dentro del agua. Agrega más: de 3 a 6 mL.' },
  ideal: { tone: 'ok', text: 'Perfecto: el haz rojo se ve claro dentro del agua y todavía se distingue el rayo reflejado.' },
  cloudy: { tone: 'bad', text: 'Demasiada leche: el agua se vuelve turbia y el haz se difumina y se apaga pronto. Quédate entre 3 y 6 mL.' },
}

// One-tap laser angles for the setup lab: each shows a different behavior of the beam.
export const SETUP_PRESETS = [
  { label: 'Casi vertical', angle: 20, hint: 'Casi no se dobla y rebota muy poco.' },
  { label: 'Medio', angle: 45, hint: 'La receta del grupo: se ve bien la refracción y algo de reflexión.' },
  { label: 'Muy inclinado', angle: 75, hint: 'Se dobla mucho y rebota bastante más luz.' },
]
