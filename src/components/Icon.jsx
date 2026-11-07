// Own SVG icon set: it looks identical on every device (no emoji or system glyphs).
// Each entry is the `d` attribute of a single 24×24 stroke path.
const ICON_PATHS = {
  fiber: 'M2 7h20M2 17h20M4 12l4-4 4 8 4-8 4 4',
  rainbow: 'M2 19a10 10 0 0 1 20 0M6 19a6 6 0 0 1 12 0M10 19a2 2 0 0 1 4 0',
  mirage: 'M12 3v2M5 6l1.4 1.4M19 6l-1.4 1.4M8 11a4 4 0 0 1 8 0M2 15c2-2 3-2 5 0s3 2 5 0 3-2 5 0 3 2 5 0M2 20c2-2 3-2 5 0s3 2 5 0 3-2 5 0 3 2 5 0',
  lens: 'M12 3c5 3.5 5 14.5 0 18-5-3.5-5-14.5 0-18ZM1 9h6M1 15h6M17 9h6M17 15h6',
  prism: 'M12 4 21 19H3ZM1 14l8-1.5M16 14.5l7-2M16.5 16.5l6.5 1.5',
  gem: 'M6 4h12l4 6-10 11L2 10ZM2 10h20M8 4l4 6 4-6M12 10v11',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z',
  menu: 'M4 7h16M4 12h16M4 17h16', close: 'M6 6l12 12M18 6 6 18', check: 'M5 12.5l4.5 4.5L19 7.5', x: 'M6 6l12 12M18 6 6 18',
  reset: 'M4 12a8 8 0 1 0 2.5-5.8M4 4v4.5h4.5', play: 'M7 5l12 7-12 7Z', pause: 'M8 5v14M16 5v14', arrowUp: 'M12 19V5M6 11l6-6 6 6',
  drop: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z', angle: 'M4 20h16M4 20 16 6M10 20a6 6 0 0 0-1.4-3.8',
  layers: 'M4 8h16v8H4ZM2 12h2M20 12h2', wave: 'M2 12c2-5 4-5 6 0s4 5 6 0 4-5 6 0', cursor: 'M5 3l14 7-6 2-2 6Z',
  expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', screen: 'M3 5h18v11H3ZM8 20h8M12 16v4', left: 'M15 5l-7 7 7 7', next: 'M6 6l6 6 6-6M6 12l6 6 6-6', right: 'M9 5l7 7-7 7',
  swap: 'M7 4v14M3 8l4-4 4 4M17 20V6M13 16l4 4 4-4', ruler: 'M3 17a9 9 0 0 1 18 0ZM12 17V9',
}
export default function Icon({ name, size = 22, className = '' }) {
  return (
    <svg className={'ic ' + className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={ICON_PATHS[name]} />
    </svg>
  )
}
