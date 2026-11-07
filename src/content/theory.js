import { SPEED_OF_LIGHT } from '../domain/constants.js'

// "Key ideas" tabs. A card is plain (`text`, optional `equation`) or has a `kind` that selects a richer block in
// features/theory/TheoryBlocks.jsx. The diagram of each topic is drawn by components/Diagram.jsx using the topic index.

const spaced = (value) => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')   // 225 564
const comma = (value, digits = 2) => value.toFixed(digits).replace('.', ',')

/** Media of the refraction tab: speed of light v = c / n, shown as bars proportional to n. */
export const INDEX_ROWS = [
  { name: 'Vacío / aire', n: 1 },
  { name: 'Agua', n: 1.33 },
  { name: 'Vidrio', n: 1.5 },
  { name: 'Diamante', n: 2.42 },
].map((row) => ({ ...row, label: comma(row.n).replace(/,00$/, ''), speed: spaced(SPEED_OF_LIGHT/1000/row.n) }))
export const LIGHT_SPEED_KM = spaced(SPEED_OF_LIGHT/1000)

/** Worked example of Snell's law (air → water, 30°). */
const EXAMPLE_N2 = 1.33, EXAMPLE_A1 = 30
const exampleSine = Math.sin(EXAMPLE_A1*Math.PI/180)/EXAMPLE_N2
export const SNELL_EXAMPLE = {
  n1: 1, n2: EXAMPLE_N2, a1: EXAMPLE_A1, sine: exampleSine, a2: Math.asin(exampleSine)*180/Math.PI,
  question: 'Un rayo pasa del aire (n = 1) al agua (n = 1,33) con un ángulo de incidencia de 30°. ¿Cuál es el ángulo de refracción?',
  steps: [
    { text: 'Escribimos la ley de Snell con los datos.', math: '1 · sen 30° = 1,33 · sen θ₂' },
    { text: 'Calculamos sen 30°.', math: `0,5 = 1,33 · sen θ₂` },
    { text: 'Despejamos sen θ₂.', math: `sen θ₂ = ${comma(exampleSine, 3)}` },
    { text: 'Con la calculadora (arcoseno):', math: `θ₂ ≈ ${Math.round(Math.asin(exampleSine)*180/Math.PI)}°` },
  ],
  conclusion: 'El rayo se acercó a la normal (30° → 22°), como se esperaba al pasar a un medio más denso.',
}

export const THEORY_TOPICS = [
  {
    id: 'reflection',
    label: 'Reflexión',
    color: '#ffb347',
    legend: [
      { term: 'Rayo incidente', text: 'El que llega a la superficie.' },
      { term: 'Rayo reflejado', text: 'El que rebota.' },
      { term: 'Normal', text: 'Línea imaginaria perpendicular a la superficie, en el punto de choque.' },
      { term: 'Ángulo de incidencia (θᵢ)', text: 'Entre el rayo incidente y la normal.' },
      { term: 'Ángulo de reflexión (θᵣ)', text: 'Entre el rayo reflejado y la normal.' },
    ],
    cards: [
      { title: '¿Qué es?', text: 'Es el rebote de la luz al chocar con una superficie: el rayo cambia de dirección y vuelve al mismo medio.' },
      { kind: 'legend', title: 'Los elementos' },
      {
        title: 'Leyes de la reflexión',
        text: 'El rayo incidente, la normal y el rayo reflejado están en un mismo plano. Y el ángulo de incidencia es igual al de reflexión.',
        equation: 'θᵢ = θᵣ',
      },
      { kind: 'types', title: 'Tipos de reflexión', examples: 'Ejemplos: espejos, el reflejo en un lago, el periscopio.' },
    ],
  },
  {
    id: 'refraction',
    label: 'Refracción',
    color: '#4de3ff',
    cards: [
      { title: '¿Qué es?', text: 'Es el cambio de dirección de la luz cuando pasa de un medio a otro de distinta densidad, porque cambia su velocidad.' },
      { kind: 'direction', title: 'Idea clave' },
      {
        kind: 'indices',
        title: 'Índice de refracción',
        text: 'Mide cuánto frena un medio a la luz. c es la velocidad de la luz en el vacío y v, la que tiene en ese medio.',
        equation: 'n = c / v',
      },
      {
        title: 'Ley de Snell',
        text: 'Relaciona los ángulos con los índices de ambos medios. Si n₂ > n₁, el rayo se acerca a la normal. Los ángulos se miden siempre desde la normal.',
        equation: 'n₁ · sen θ₁ = n₂ · sen θ₂',
      },
      { kind: 'example', title: 'Ejemplo resuelto' },
      {
        kind: 'daily',
        title: 'En la vida diaria',
        items: [
          { title: 'El lápiz «quebrado»', text: 'Dentro de un vaso con agua, el lápiz se ve partido: la luz se desvía al salir del agua.' },
          { title: 'La piscina «poco profunda»', text: 'Parece menos honda de lo que es, porque los rayos que vienen del fondo se desvían al salir.' },
        ],
        more: 'El arcoíris, los lentes y las cámaras están en Aplicaciones.',
      },
    ],
  },
  {
    id: 'total-reflection',
    label: 'Reflexión total',
    color: '#a98bff',
    cards: [
      { title: 'Condición', text: 'Ocurre al pasar de un medio con mayor n a uno con menor n (por ejemplo, agua → aire).' },
      {
        title: 'Ángulo crítico',
        text: 'Ángulo de incidencia desde el cual ya no hay rayo refractado: toda la luz se refleja.',
        equation: 'sen θc = n₂ / n₁',
      },
      {
        title: '¿Dónde se ve?',
        text: 'En la fibra óptica, donde la luz rebota dentro de un hilo de vidrio y viaja kilómetros, y en el brillo de los diamantes.',
      },
    ],
  },
]
