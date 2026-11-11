// Conclusions, in the same order as the page sections. `diagram` is the theory topic index drawn next to the text;
// when it is null the card shows `badge` (a big number or word with a short caption) instead.

export const CONCLUSIONS = [
  {
    title: 'Historia',
    color: '#ff9a4d',
    diagram: null,
    badge: { value: '20 siglos', text: 'de ideas: del rayo recto de Euclides a la ley de Snell' },
    formula: 'Ptolomeo midió · Snell encontró · Descartes publicó',
    text: 'La reflexión se entendió primero; la refracción tardó siglos. Ptolomeo midió ángulos sin hallar la fórmula, Snell la descubrió en 1621 y Descartes la publicó en 1637.',
  },
  {
    title: 'Reflexión',
    color: '#ffb347',
    diagram: 0,
    formula: 'θᵢ = θᵣ',
    text: 'La reflexión cumple θᵢ = θᵣ en cualquier superficie lisa, sin importar los medios. En una superficie rugosa la luz rebota en todas direcciones (reflexión difusa).',
  },
  {
    title: 'Refracción',
    color: '#4de3ff',
    diagram: 1,
    formula: 'n₁ · sen θ₁ = n₂ · sen θ₂',
    text: 'La luz cambia de dirección porque cambia de velocidad (n = c ÷ v). Al pasar a un medio de mayor índice n el rayo se acerca a la normal, y a uno de menor n se aleja.',
  },
  {
    title: 'Reflexión total interna',
    color: '#a98bff',
    diagram: 2,
    formula: 'θc = arcsen(n₂ ÷ n₁),  n₁ > n₂',
    text: 'Solo ocurre de un medio de mayor n a uno de menor n y a partir del ángulo crítico: toda la luz rebota y nada sale.',
  },
  {
    title: 'Dispersión y prisma',
    color: '#e27bff',
    diagram: null,
    badge: { value: 'n(λ)', text: 'cada color se dobla distinto: el violeta más, el rojo menos' },
    formula: 'prisma + prisma invertido = luz blanca otra vez',
    text: 'La luz blanca es una mezcla de colores. El vidrio frena más al violeta que al rojo, por eso el prisma la abre en un arcoíris continuo; con un segundo prisma al revés (Newton) los colores se juntan de nuevo.',
  },
  {
    title: 'Aplicaciones',
    color: '#ffcf4d',
    diagram: null,
    badge: { value: '6 usos', text: 'fibra óptica, arcoíris, espejismos, lentes, prismáticos y diamantes' },
    formula: null,
    text: 'La refracción y la reflexión total explican cómo viaja internet por un hilo de vidrio, por qué aparece el arcoíris, por qué brilla un diamante (n ≈ 2,42) y cómo funcionan lentes y prismáticos.',
  },
  {
    title: 'Experimento y laboratorio libre',
    color: '#3fe3a0',
    diagram: null,
    badge: { value: '< 5 %', text: 'de error: medida y teoría coinciden' },
    formula: 'error % = |n medido − n real| ÷ n real × 100',
    text: 'Con agua, 3 a 6 mL de leche y un láser rojo vimos refracción y reflexión a la vez. El montaje sirvió para observar, la práctica para aprender a leer el transportador y el laboratorio de luz para explorar otros materiales. Las diferencias con la teoría vienen de la lectura del transportador y del ancho del haz.',
  },
  {
    title: 'Problemas resueltos',
    color: '#6f9bff',
    diagram: null,
    badge: { value: '3 de 3', text: 'problemas de prismas resueltos con la ley de Snell' },
    formula: 'Problema 10: n = 1,3 · Problema 11: 53° · Problema 13: √2',
    text: 'Aplicar Snell y la geometría del prisma paso a paso lleva siempre al resultado: primero se dibuja el rayo y la normal, luego se calculan los ángulos de cada cara.',
  },
]

export const CONCLUSIONS_KEY_IDEA = 'La luz cambia de dirección porque cambia de velocidad al pasar de un medio a otro (n = c ÷ v): un n mayor frena más la luz, y la diferencia entre los n de los dos medios decide cuánto se dobla el rayo. Todo lo demás, del arcoíris a la fibra óptica, sale de esa idea.'
