// Sources shown in the references section, in one single list. `topic` says what the source is good for.
// `url` is only set for online resources; the citation text is built by `citationOf` for the "Copiar cita" button.

export const REFERENCES = [
  {
    title: 'Optics', authors: 'Encyclopaedia Britannica', publisher: 'Britannica',
    topic: 'Panorama de la óptica y de cómo evolucionaron las ideas sobre la luz.', url: 'https://www.britannica.com/science/optics',
  },
  {
    title: 'Línea de tiempo de la óptica geométrica (unidad 1)', authors: 'Facultad de Estudios Superiores Iztacala', publisher: 'UNAM',
    topic: 'Línea de tiempo con los hitos de la óptica geométrica, ordenados por época.', url: 'https://enlinea.iztacala.unam.mx/resources/modules/OpticaGeometrica/Recursos/U1/linea-tiempo/',
  },
  {
    title: 'IV. Reflexión y refracción de la luz', authors: 'La ciencia para todos (vol. 2, n.º 107)', publisher: 'Biblioteca Digital del ILCE',
    topic: 'Cómo se descubrieron las leyes de la reflexión y la refracción, con Snell, Descartes y Newton.', url: 'https://bibliotecadigital.ilce.edu.mx/sites/ciencia/volumen2/ciencia3/107/htm/sec_8.htm',
  },
  {
    title: 'Bending Light (Reflexión y refracción)', authors: 'PhET Interactive Simulations', publisher: 'Universidad de Colorado Boulder',
    topic: 'Simulación interactiva para experimentar con rayos de luz, ángulos de incidencia y la ley de Snell.', url: 'https://phet.colorado.edu/es/simulation/bending-light',
  },
  {
    title: 'Khan Academy en Español', authors: 'Khan Academy', publisher: 'Khan Academy',
    topic: 'Lecciones guiadas, explicaciones teóricas y problemas prácticos de óptica geométrica.', url: 'https://es.khanacademy.org/',
  },
  {
    title: 'Refracción de la luz', authors: 'Wikipedia, la enciclopedia libre', publisher: 'Wikipedia',
    topic: 'Marco teórico de la refracción, velocidad de la luz en los medios y tablas de índices de refracción.', url: 'https://es.wikipedia.org/wiki/Refracci%C3%B3n_de_la_luz',
  },
]

/** Plain-text citation for one reference (what "Copiar cita" puts on the clipboard). */
export const citationOf = ({ authors, title, publisher, url }) => `${authors}. ${title}. ${publisher}.${url ? ' ' + url : ''}`
