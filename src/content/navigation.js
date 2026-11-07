// Page order. The header, the footer and the presentation mode all follow this list, and <main> in App.jsx
// renders its sections in the same order. `id` is also the section anchor (#id) and the key of its CSS accent (--h-id).

export const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'integrantes', label: 'Integrantes' },
  { id: 'historia', label: 'Historia' },
  { id: 'contenido', label: 'Contenido' },
  { id: 'comparacion', label: 'Comparación' },
  { id: 'prisma', label: 'Prisma' },
  { id: 'aplicaciones', label: 'Aplicaciones' },
  { id: 'experimento', label: 'Experimento' },
  { id: 'simulador', label: 'Simulador' },
  { id: 'problemas', label: 'Problemas' },
  { id: 'conclusiones', label: 'Conclusiones' },
  { id: 'referencias', label: 'Referencias' },
]

/** Navigation entries for the sections that are actually rendered (the team section is hidden when it is empty). */
export const visibleNavItems = (hasTeam) => NAV_ITEMS.filter((item) => item.id !== 'integrantes' || hasTeam)
