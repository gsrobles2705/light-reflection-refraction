// Sources shown in the references section. `kind`: 'book' | 'web'. `topic` says what the source is good for.
// `url` is only set for online resources; `citation` is the text copied by the "Copiar cita" button.

export const REFERENCE_GROUPS = [
  { id: 'book', title: 'Libros', icon: 'layers' },
  { id: 'web', title: 'Recursos en línea', icon: 'expand' },
]

export const REFERENCES = [
  {
    kind: 'book', title: 'Física universitaria con física moderna, vol. 2', authors: 'Young, H. D. y Freedman, R. A.', publisher: 'Pearson',
    topic: 'Óptica geométrica: reflexión, refracción y reflexión total interna.',
  },
  {
    kind: 'book', title: 'Física para ciencias e ingeniería', authors: 'Serway, R. A. y Jewett, J. W.', publisher: 'Cengage Learning',
    topic: 'Ley de Snell, índice de refracción y problemas resueltos.',
  },
  {
    kind: 'book', title: 'Óptica', authors: 'Hecht, E.', publisher: 'Addison-Wesley / Pearson',
    topic: 'Referencia de consulta: dispersión, prismas y propagación de la luz.',
  },
  {
    kind: 'web', title: 'Refraction & Snell’s law', authors: 'HyperPhysics', publisher: 'Georgia State University',
    topic: 'Resumen claro de la ley de Snell con ejemplos numéricos.', url: 'https://hyperphysics.phy-astr.gsu.edu',
  },
  {
    kind: 'web', title: 'Bending Light (Reflexión y refracción)', authors: 'PhET Interactive Simulations', publisher: 'University of Colorado Boulder',
    topic: 'Simulador de referencia para comparar con nuestro laboratorio de luz.', url: 'https://phet.colorado.edu/en/simulations/bending-light',
  },
]

/** Plain-text citation for one reference (what "Copiar cita" puts on the clipboard). */
export const citationOf = ({ authors, title, publisher, url }) => `${authors}. ${title}. ${publisher}.${url ? ' ' + url : ''}`
