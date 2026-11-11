// Prism lab: the guided story told while the user scrolls, and the color chips. Each story step carries the
// prism settings it applies (see DEFAULT_PRISM_SETTINGS in domain/prism.js). `rotation: 'min'` means "let the
// tracer find a comfortable rotation".

export const PRISM_STORY = [
  {
    title: 'La luz viaja recta',
    text: 'En el aire, un haz de luz va en línea recta. Todavía no hay prisma en su camino.',
    settings: { prismHidden: true, whiteLight: false, wavelength: 550, dispersion: false, newtonPair: false, material: 1, apexAngle: 50, rotation: 6.25, laserY: 190, laserAngle: -8 },
  },
  {
    title: 'Entra al vidrio y se dobla',
    text: 'Al entrar al vidrio la luz frena y cambia de dirección. Al salir, se dobla otra vez. Es la refracción en las dos caras.',
    settings: { prismHidden: false, whiteLight: false, wavelength: 550, dispersion: false, newtonPair: false, material: 1, apexAngle: 50, rotation: 'min', laserY: 190, laserAngle: -8 },
  },
  {
    title: 'La luz blanca se abre en colores',
    text: 'La luz blanca mezcla todos los colores. El vidrio frena más al violeta que al rojo, así que el violeta se desvía más. Dentro del vidrio los colores apenas empiezan a separarse; al salir se abren mucho más.',
    settings: { prismHidden: false, whiteLight: true, dispersion: true, newtonPair: false, material: 1, apexAngle: 50, laserY: 190, laserAngle: -8, rotation: 'min' },
  },
  {
    title: 'Así nace el arcoíris',
    text: 'Una gota de agua hace lo mismo que el prisma: separa los colores. Con agua el abanico es más cerrado, pero está ahí.',
    settings: { prismHidden: false, whiteLight: true, dispersion: true, newtonPair: false, material: 3, apexAngle: 75, laserY: 170, laserAngle: 0, rotation: 16.5 },
  },
  {
    title: 'Experimento de Newton',
    text: 'Newton puso un segundo prisma al revés y los colores volvieron a juntarse en luz blanca. El prisma no pinta la luz: la separa.',
    settings: { prismHidden: false, whiteLight: true, dispersion: true, newtonPair: true, pairGap: 12, material: 1, apexAngle: 60, laserY: 205, laserAngle: 0, rotation: 24 },
  },
]

/** Color chips under the canvas: representative wavelength (nm) and label. */
export const SPECTRUM_CHIPS = [
  { wavelength: 400, label: 'Violeta' },
  { wavelength: 450, label: 'Azul' },
  { wavelength: 490, label: 'Cian' },
  { wavelength: 530, label: 'Verde' },
  { wavelength: 580, label: 'Amarillo' },
  { wavelength: 610, label: 'Naranja' },
  { wavelength: 680, label: 'Rojo' },
]
