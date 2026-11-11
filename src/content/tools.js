// The three interactive tools of the page and what each one is for. A guide strip repeats this list so nobody
// mixes them up: the group's setup is for watching, the practice is for measuring, the light lab is for exploring.

export const TOOLS = [
  {
    id: 'montaje',
    name: 'Montaje del grupo',
    verb: 'Observar',
    color: '#ff4d4d',
    use: 'ver con tus propios ojos qué pasa en el recipiente real del grupo: el láser entra al agua, se dobla y una parte rebota. Cambia el agua, la leche y el ángulo para saber qué necesitas preparar.',
    not: 'medir ni calificarte. Aquí solo miras y entiendes el experimento antes de hacerlo.',
  },
  {
    id: 'practica',
    name: 'Práctica de medición',
    verb: 'Medir',
    color: '#4de3ff',
    use: 'entrenar la lectura del transportador: lees θ₂, escribes tu número y el programa te dice si acertaste. También calcula n y tu error, igual que harás en la mesa.',
    not: 'explorar otros casos: solo hay agua y un material misterioso, y la meta es leer bien los grados.',
  },
  {
    id: 'laboratorio',
    name: 'Laboratorio libre',
    verb: 'Explorar',
    color: '#a98bff',
    use: 'probar libremente cualquier ángulo, color de luz y material (aire, agua, vidrio, diamante) y descubrir cuándo la luz se dobla, rebota o queda atrapada dentro (reflexión total).',
    not: 'seguir un procedimiento ni obtener nota: es un espacio libre para preguntarte «¿y si…?».',
  },
]
