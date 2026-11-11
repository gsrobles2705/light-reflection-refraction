import Icon from './Icon.jsx'

/**
 * Colorful illustrations for the "real life applications" cards. Each one is drawn on a 64 × 64 grid with its own
 * palette and shows the physics it stands for (a ray trapped in a fibre, a rainbow, a mirage, a lens focusing, a prism
 * folding the light, a faceted gem). Unknown names fall back to the plain line icon.
 */
const ART = {
  fiber: (
    <>
      <defs>
        <linearGradient id="ai-fiber" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#2b6bff" /><stop offset="1" stopColor="#5ee7ff" /></linearGradient>
      </defs>
      <path d="M8 50L56 14" stroke="url(#ai-fiber)" strokeWidth="17" strokeLinecap="round" />
      <path d="M8 50L56 14" stroke="#0b1d44" strokeOpacity=".55" strokeWidth="11.5" strokeLinecap="round" />
      <path d="M5.5 46.6 L18.2 47.6 L20.8 35.1 L33.6 36.1 L36.2 23.6 L48.9 24.6 L51.6 12.1" fill="none" stroke="#ffe14d" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="56" cy="14" r="3.4" fill="#fff8c4" />
      <path d="M13 22l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#9fe9ff" />
    </>
  ),
  rainbow: (
    <>
      <path d="M5 46A27 27 0 0 1 59 46" fill="none" stroke="#ff4d5e" strokeWidth="4.6" strokeLinecap="round"/><path d="M9.5 46A22.5 22.5 0 0 1 54.5 46" fill="none" stroke="#ff9a3d" strokeWidth="4.6" strokeLinecap="round"/><path d="M14 46A18 18 0 0 1 50 46" fill="none" stroke="#ffe14d" strokeWidth="4.6" strokeLinecap="round"/><path d="M18.5 46A13.5 13.5 0 0 1 45.5 46" fill="none" stroke="#5fe08a" strokeWidth="4.6" strokeLinecap="round"/><path d="M23 46A9 9 0 0 1 41 46" fill="none" stroke="#3fb8ff" strokeWidth="4.6" strokeLinecap="round"/>
      <g fill="#fff"><circle cx="9" cy="50" r="5.5" /><circle cx="16" cy="53" r="6" /><circle cx="23" cy="52" r="4.5" /><circle cx="55" cy="50" r="5.5" /><circle cx="48" cy="53" r="6" /><circle cx="41" cy="52" r="4.5" /></g>
      <g fill="#cfe3ff" opacity=".55"><circle cx="16" cy="55.5" r="4" /><circle cx="48" cy="55.5" r="4" /></g>
    </>
  ),
  mirage: (
    <>
      <defs>
        <radialGradient id="ai-sun" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#fff1a8" /><stop offset=".55" stopColor="#ffc233" /><stop offset="1" stopColor="#ff7a00" /></radialGradient>
        <linearGradient id="ai-heat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb347" /><stop offset="1" stopColor="#35c7ff" /></linearGradient>
      </defs>
      <g stroke="#ffc233" strokeWidth="2.4" strokeLinecap="round"><path d="M32 3v4M14 12l3 3M50 12l-3 3M6 24h4M54 24h4" /></g>
      <circle cx="32" cy="22" r="10" fill="url(#ai-sun)" />
      <path d="M4 34h56" stroke="#ffcf7a" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="32" cy="46" rx="8.5" ry="4.2" fill="#ffc233" opacity=".38" />
      <g fill="none" stroke="url(#ai-heat)" strokeWidth="3.2" strokeLinecap="round"><path d="M6 41q6-5 13 0t13 0 13 0 13 0" /><path d="M6 49q6-5 13 0t13 0 13 0 13 0" opacity=".8" /><path d="M6 57q6-5 13 0t13 0 13 0 13 0" opacity=".6" /></g>
    </>
  ),
  lens: (
    <>
      <defs>
        <linearGradient id="ai-lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bfe3ff" /><stop offset=".5" stopColor="#4c9dff" /><stop offset="1" stopColor="#2447d8" /></linearGradient>
      </defs>
      <g fill="none" stroke="#ffd54a" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18H26L60 32" /><path d="M3 32H60" /><path d="M3 46H26L60 32" /></g>
      <path d="M32 6C48 19 48 45 32 58C16 45 16 19 32 6Z" fill="url(#ai-lens)" fillOpacity=".82" stroke="#dff0ff" strokeWidth="2" />
      <path d="M27 16C22 25 22 39 27 48" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="60" cy="32" r="3.4" fill="#fff4b0" stroke="#ffd54a" strokeWidth="1.6" />
    </>
  ),
  prism: (
    <>
      <defs>
        <linearGradient id="ai-prism" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#6d4aff" /><stop offset="1" stopColor="#c9b6ff" /></linearGradient>
      </defs>
      <path d="M10 52H54V8Z" fill="url(#ai-prism)" fillOpacity=".9" stroke="#e6dcff" strokeWidth="2" strokeLinejoin="round" />
      <path d="M19 49H49V19Z" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M34 64V28L62 28" fill="none" stroke="#ff8fd8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="34" cy="28" r="3" fill="#fff" />
      <path d="M56 22l-4 6 4 6" fill="none" stroke="#ffd1f0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  gem: (
    <>
      <defs>
        <linearGradient id="ai-gem" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9ff7ff" /><stop offset=".5" stopColor="#37d9c6" /><stop offset="1" stopColor="#3a7bff" /></linearGradient>
      </defs>
      <path d="M20 12H44L58 26L32 58L6 26Z" fill="url(#ai-gem)" />
      <path d="M6 26H58M20 12L26 26L32 58L38 26L44 12M26 26L32 12L38 26" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M20 12L26 26H6Z" fill="#fff" fillOpacity=".3" />
      <path d="M32 58L38 26H58Z" fill="#1c3fb5" fillOpacity=".3" />
      <path d="M54 4l2.2 5 5 2.2-5 2.2L54 18.4l-2.2-5L46.8 11.2l5-2.2z" fill="#fff6b0" />
    </>
  ),
}

/** Colorful illustration of an application; falls back to the plain icon when there is no artwork for `name`. */
export default function AppIcon({ name, size = 56 }) {
  const art = ART[name]
  if (!art) return <Icon name={name} size={size} />
  return <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden="true" focusable="false">{art}</svg>
}
