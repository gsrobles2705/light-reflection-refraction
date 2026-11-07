// Deployment-level settings. Override the public URL (shown in the hero QR code) without touching
// the code by defining VITE_SITE_URL in a `.env` file; see `.env.example`.
export const SITE_URL = import.meta.env?.VITE_SITE_URL || 'https://fisica.5touni.workers.dev'

// Course information shown in the hero, the footer and the browser tab title.
export const COURSE = {
  classroom: '5to UNI',
  subject: 'Física',
  week: 'Semana 36',
  topic: 'Reflexión y Refracción',
  term: 'IV Bimestre',
}
