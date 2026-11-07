// Solved exam problems. The statements are images (assets/problems); the numbers of the worked solutions are computed
// here, so the steps, the options and the final answer cannot drift apart.
const comma = (value, digits = 2) => value.toFixed(digits).replace('.', ',')
const toDegrees = (radians) => radians*180/Math.PI

const oilIndex = 1.5*Math.sin(Math.PI/3)                 // problem 10: n_oil = 1.5·sen 60°
const prismAngle = toDegrees(Math.acos(4/5))             // problem 11: cos θ = 4/5
const prismComplement = 90 - prismAngle
const prismIndex = Math.sin(Math.PI/4)/Math.sin(Math.PI/6)   // problem 13: n = sen 45° / sen 30°

const letters = ['a', 'b', 'c', 'd', 'e']
const withLetters = (list) => list.map(([text, value], i) => ({ key: letters[i], text, value }))

export const PROBLEMS = [
  {
    id: 10, who: 'Mariel Jayo', title: 'Prisma con película de aceite',
    alt: 'Problema 10: prisma de índice 1,5 con una película de aceite sobre la cara AC; un rayo entra normal a la cara AB y sale rasante a la interfaz prisma-película. Se pide el índice del aceite. Opciones: a) 1,1, b) 1,3, c) 1,5, d) 1,6, e) 1,2.',
    options: withLetters([['1,1', 1.1], ['1,3', 1.3], ['1,5', 1.5], ['1,6', 1.6], ['1,2', 1.2]]),
    value: oilIndex, answer: 'b', result: `n del aceite ≈ ${comma(oilIndex)} ≈ 1,3`,
    steps: [
      { title: 'Datos', text: 'n del prisma = 1,5. El ángulo en A mide 60°. El rayo entra normal a la cara AB y sale rasante a AC: θ₂ = 90°.' },
      { title: 'Entrada sin desvío', text: 'Incide normalmente en AB (a 90° de la cara), así que no se refracta: sigue recto dentro del prisma.' },
      { title: 'Ángulo con la cara AC', text: 'El rayo es perpendicular a AB y la cara AB forma 60° con AC. Entonces el rayo forma 90° − 60° = 30° con la cara AC.' },
      { title: 'Ángulo de incidencia', text: 'El ángulo de incidencia se mide con la normal, no con la cara: θ₁ = 90° − 30° = 60°.' },
      { title: 'Ley de Snell en la interfaz', text: 'Prisma → aceite, con salida rasante (θ₂ = 90°).', formula: 'n₁·sen θ₁ = n₂·sen θ₂  →  1,5·sen 60° = n·sen 90°', figure: { a1: 60, a2: 90, top: 'prisma · n = 1,5', bottom: 'aceite · n = ?', labels: ['60°', '90°'] } },
      { title: 'Calculamos', text: 'Con sen 60° = √3 / 2 y sen 90° = 1:', formula: `n = 1,5 · (√3 / 2) ≈ ${comma(oilIndex)}` },
    ],
  },
  {
    id: 11, who: 'Manuel Gouro', title: 'Prisma rectángulo con haz horizontal',
    alt: 'Problema 11: prisma triangular rectángulo de índice 5/4; un haz incide perpendicularmente a la cara vertical y se refracta paralelo a la cara AB. Se pide el complemento del ángulo θ. Opciones: a) 37°, b) 30°, c) 53°, d) 45°, e) 60°.',
    options: withLetters([['37°', 37], ['30°', 30], ['53°', 53], ['45°', 45], ['60°', 60]]),
    value: prismComplement, answer: 'c', result: `Complemento de θ = 90° − ${Math.round(prismAngle)}° = ${Math.round(prismComplement)}°`,
    steps: [
      { title: 'Datos', text: 'n del prisma = 5/4. El haz incide perpendicular a la cara vertical y sale paralelo a AB: refracción rasante, θ₂ = 90°.' },
      { title: 'Dentro del prisma', text: 'Al entrar a 90° de la cara no se desvía: el haz sigue horizontal hasta llegar a la cara AB.' },
      { title: 'Ángulo de incidencia en AB', text: 'La cara AB forma θ con la base horizontal, y el haz es horizontal: el haz forma θ con AB. Respecto a la normal, θ₁ = 90° − θ.' },
      { title: 'Ley de Snell en AB', text: 'Prisma → aire, con salida rasante:', formula: '(5/4)·sen(90° − θ) = 1·sen 90°', figure: { a1: 53, a2: 90, top: 'prisma · n = 5/4', bottom: 'aire · n = 1', labels: ['90° − θ', '90°'] } },
      { title: 'Despejamos θ', text: 'Como sen(90° − θ) = cos θ:', formula: `(5/4)·cos θ = 1  →  cos θ = 4/5  →  θ = ${Math.round(prismAngle)}°` },
      { title: 'Piden el complemento', text: 'El complemento de θ es 90° − 37° = 53°. Es justo el ángulo de incidencia en AB.' },
    ],
  },
  {
    id: 13, who: 'Gabriel Robles', title: 'Trayectoria de un haz en un prisma',
    alt: 'Problema 13: un haz entra perpendicular a la cara superior de un prisma (ángulo de 30° con la base), llega a la base y sale al aire formando 45° con ella. Se pide el índice de refracción. Opciones: a) √2, b) 2, c) 2√2, d) 4, e) 4√2.',
    options: withLetters([['√2', Math.SQRT2], ['2', 2], ['2√2', 2*Math.SQRT2], ['4', 4], ['4√2', 4*Math.SQRT2]]),
    value: prismIndex, answer: 'a', result: `n del prisma = ${comma(prismIndex, 3)} = √2`,
    steps: [
      { title: 'Datos', text: 'La cara superior forma 30° con la base. El haz entra perpendicular a esa cara y sale al aire formando 45° con la base.' },
      { title: 'Entrada sin desvío', text: 'Entra a 90° de la cara superior, así que no se refracta: sigue recto dentro del prisma.' },
      { title: 'Dirección del haz', text: 'El haz es perpendicular a una cara que forma 30° con la base, por eso forma 60° con la base.' },
      { title: 'Ángulo de incidencia en la base', text: 'La normal a la base es vertical: θ₁ = 90° − 60° = 30°.' },
      { title: 'Ángulo de salida', text: 'Sale formando 45° con la base, es decir θ₂ = 90° − 45° = 45° respecto a la normal.' },
      { title: 'Ley de Snell en la base', text: 'Prisma → aire:', formula: 'n·sen 30° = 1·sen 45°', figure: { a1: 30, a2: 45, top: 'prisma · n = ?', bottom: 'aire · n = 1', labels: ['30°', '45°'] } },
      { title: 'Calculamos', text: 'Con sen 30° = 1/2 y sen 45° = √2 / 2:', formula: 'n = (√2 / 2) ÷ (1 / 2) = √2' },
    ],
  },
]
