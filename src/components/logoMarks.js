// Logo proposals, all without a background tile. Neutral strokes use `currentColor` (so the mark follows the page text
// color in both themes) and the spectrum is a gradient. Each `inner(id)` returns the SVG content for a 48×48 box; `id`
// makes the gradient ids unique when the logo appears several times on the page.

const SPECTRUM = ['#ff4d5e', '#ff9a3d', '#ffe14d', '#5fe08a', '#3fd5e6', '#4d7dff', '#a56bff']
const stops = () => SPECTRUM.map((color, i) => `<stop offset="${(i/(SPECTRUM.length - 1)).toFixed(2)}" stop-color="${color}"/>`).join('')
/** A spectrum gradient across the given user-space line. */
const gradient = (id, x1, y1, x2, y2) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops()}</linearGradient>`

export const LOGO_MARKS = [
  {
    id: 'haz', name: 'Haz refractado',
    inner: (id) => `<defs>${gradient(id, 22, 26, 42, 44)}</defs>
      <path d="M4 26H44" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      <path d="M22 6V44" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.5 3.5" stroke-linecap="round" opacity=".45"/>
      <path d="M7 6 22 26" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M22 26 40.5 42.5" stroke="url(#${id})" stroke-width="5" stroke-linecap="round"/>
      <circle cx="22" cy="26" r="3" fill="currentColor"/>`,
  },
  {
    id: 'gota', name: 'Gota y arcoíris',
    inner: (id) => `<defs>${gradient(id, 12, 34, 36, 34)}</defs>
      <path d="M24 4C24 4 9.5 20.5 9.5 31a14.5 14.5 0 0 0 29 0C38.5 20.5 24 4 24 4Z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M15 34a9 9 0 0 1 18 0" fill="none" stroke="url(#${id})" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M19 34a5 5 0 0 1 10 0" fill="none" stroke="url(#${id})" stroke-width="3.2" stroke-linecap="round" opacity=".7"/>
      <path d="M17 24.5c1-2.8 2.6-5 4.6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".5" fill="none"/>`,
  },
  {
    id: 'lente', name: 'Lente que enfoca',
    inner: (id) => `<defs>${gradient(id, 16, 24, 45, 24)}</defs>
      <path d="M22 4C31.5 13 31.5 35 22 44C12.5 35 12.5 13 22 4Z" fill="currentColor" fill-opacity=".1" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M3 15.5H15M3 24H14M3 32.5H15" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>
      <path d="M25 17 44 24M26 24H44M25 31 44 24" stroke="url(#${id})" stroke-width="2.8" stroke-linecap="round"/>
      <circle cx="44" cy="24" r="2.2" fill="#ffe14d"/>`,
  },
  {
    id: 'destello', name: 'Destello espectral',
    inner: (id) => `<defs>${gradient(id, 6, 6, 42, 42)}</defs>
      <path d="M24 3C25.6 16.5 31.5 22.4 45 24C31.5 25.6 25.6 31.5 24 45C22.4 31.5 16.5 25.6 3 24C16.5 22.4 22.4 16.5 24 3Z" fill="url(#${id})"/>
      <circle cx="24" cy="24" r="3.4" fill="#fff" opacity=".9"/>
      <circle cx="39" cy="9" r="2" fill="url(#${id})"/><circle cx="9" cy="39" r="1.6" fill="url(#${id})"/>`,
  },
  {
    id: 'monograma', name: 'L con onda',
    inner: (id) => `<defs>${gradient(id, 12, 34, 45, 34)}</defs>
      <path d="M11 5V33" stroke="currentColor" stroke-width="5.4" stroke-linecap="round"/>
      <path d="M11 35C17 22 22 22 27.5 35S39 48 45 33" fill="none" stroke="url(#${id})" stroke-width="5.4" stroke-linecap="round"/>
      <circle cx="11" cy="35" r="2.4" fill="var(--bg,#fff)" stroke="currentColor" stroke-width="1.6"/>`,
  },
  {
    id: 'reflejo', name: 'Reflejo en espejo',
    inner: (id) => `<defs>${gradient(id, 24, 36, 41, 8)}</defs>
      <path d="M5 37H43" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <path d="M9 43l3-3.5M18 43l3-3.5M27 43l3-3.5M36 43l3-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".45"/>
      <path d="M24 8V37" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.5 3.5" stroke-linecap="round" opacity=".45"/>
      <path d="M7.5 7 24 36" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M24 36 40.5 7" stroke="url(#${id})" stroke-width="5" stroke-linecap="round"/>
      <circle cx="24" cy="36" r="3" fill="currentColor"/>`,
  },
]

/** The proposal the page uses. Change this id to try another one (ids in LOGO_MARKS). */
export const ACTIVE_LOGO = 'monograma'
