// Team members. Fill `role` to show it under the name; `photo` is an optional path inside /public (e.g. '/equipo/ana.jpg').
// Entries without a name are only shown as placeholders in development (npm run dev).

export const TEAM = [
  { name: 'Gabriel Robles', role: 'Expositor', photo: '' },
  { name: 'Angela Villanueva', role: 'Historia', photo: '' },
  { name: 'Ashley Gutierrez', role: 'Teoría', photo: '' },
  { name: 'Jorge Casavilca', role: 'Experimento', photo: '' },
  { name: 'Mariel Jayo', role: 'Problema 10', photo: '' },
  { name: 'Manuel Gouro', role: 'Problema 11', photo: '' },
  { name: 'Eduardo Lopez', role: 'Problema 13', photo: '' },
]

/** Members to display: only those with a name in production; placeholders too while developing. */
export const visibleTeam = (showPlaceholders) => TEAM.filter((member) => member.name || showPlaceholders)
