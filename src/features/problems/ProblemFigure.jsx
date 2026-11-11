import { PROBLEM_FIGURES } from '../../content/problemMarks.js'

const polar = (center, radius, degrees) => [center[0] + radius*Math.cos(degrees*Math.PI/180), center[1] - radius*Math.sin(degrees*Math.PI/180)]
/** SVG path of the arc that goes from angle `from` to angle `to` around `at` (counter-clockwise when `to` > `from`). */
const arcPath = ({ at, r, from, to }) => {
  const start = polar(at, r, from), end = polar(at, r, to)
  return `M${start[0].toFixed(1)} ${start[1].toFixed(1)}A${r} ${r} 0 0 ${to > from ? 0 : 1} ${end[0].toFixed(1)} ${end[1].toFixed(1)}`
}

/** A label on a rounded plate, centered on (x, y). */
function Pill({ mark }) {
  const size = mark.small ? 34 : 42, width = Math.max(64, mark.text.length*size*0.58 + 34), height = size + 22
  return (
    <g className={'pm-pill pm-' + mark.tone} transform={`translate(${mark.x} ${mark.y})`}>
      <g className="pm-pop">
        <rect x={-width/2} y={-height/2} width={width} height={height} rx={height/2} />
        <text y={size*0.35} textAnchor="middle" fontSize={size}>{mark.text}</text>
      </g>
    </g>
  )
}

/**
 * The statement image with the solution drawn on top of it, step by step: rays, normals, angle arcs and result labels
 * appear as the matching step of the explanation is shown (`visible` counts the steps on screen).
 */
export default function ProblemFigure({ problem, src, visible }) {
  const figure = PROBLEM_FIGURES[problem.id], [width, height] = figure.size
  const marks = figure.marks.filter((mark) => visible > mark.step && (mark.until == null || visible <= mark.until + 1))
  return (
    <div className="pm-wrap" style={{ '--pm-w': width, '--pm-h': height }}>
      <img src={src} alt={problem.alt} loading="lazy" />
      <svg className="pm-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Solución dibujada sobre la figura del problema">
        <defs>
          {['ray', 'out'].map((tone) => <marker key={tone} id={`pm-head-${tone}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" className={'pm-fill pm-' + tone} /></marker>)}
        </defs>
        {marks.map((mark, i) => {
          const key = `${problem.id}-${mark.type}-${mark.step}-${i}`
          if (mark.type === 'pill') return <Pill key={key} mark={mark} />
          if (mark.type === 'arc') return <path key={key} className={'pm-line pm-arc pm-' + mark.tone} d={arcPath(mark)} pathLength="1" />
          const [from, to] = [mark.from, mark.to]
          return <path key={key} className={'pm-line pm-' + mark.tone} d={`M${from[0]} ${from[1]}L${to[0]} ${to[1]}`} pathLength="1" markerEnd={mark.type === 'ray' ? `url(#pm-head-${mark.tone})` : undefined} />
        })}
      </svg>
    </div>
  )
}
