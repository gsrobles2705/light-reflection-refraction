import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Icon from '../../components/Icon.jsx'
import SnellFigure from '../../components/SnellFigure.jsx'
import { INDEX_ROWS, LIGHT_SPEED_KM, SNELL_EXAMPLE } from '../../content/theory.js'

const EASE = [0.23, 1, 0.32, 1]
const toDegrees = (radians) => radians*180/Math.PI

/** Glossary of the parts of a reflection, in the colors of the diagram. */
export function Legend({ items }) {
  return (
    <ul className="tleg">
      {items.map((item, i) => (
        <motion.li key={item.term} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i*0.07, duration: 0.45, ease: EASE }}>
          <i aria-hidden="true">{i + 1}</i><span><b>{item.term}</b>{item.text}</span>
        </motion.li>
      ))}
    </ul>
  )
}

// Rays of the specular / diffuse picture: incident rays hit the surface at x = 75, 155 and 235
const HITS = [75, 155, 235]
const SPECULAR = HITS.map((x) => [[x + 55, 12]])
const DIFFUSE = [[[28, 40], [120, 14]], [[100, 14], [225, 22]], [[190, 30], [305, 60]]]
const BUMPS = Array.from({ length: 26 }, (_, i) => `${10 + i*12},${110 + [0, -6, 3, -5, 4, -3][i % 6]}`).join(' ')

/** Switch between specular and diffuse reflection with an animated picture of the rays. */
export function ReflectionTypes({ examples }) {
  const [mode, setMode] = useState('specular'), diffuse = mode === 'diffuse'
  const reflected = diffuse ? DIFFUSE : SPECULAR
  return (
    <div className="ttypes">
      <div className="tseg" role="group" aria-label="Tipo de reflexión">
        <button type="button" aria-pressed={!diffuse} onClick={() => setMode('specular')}>Especular</button>
        <button type="button" aria-pressed={diffuse} onClick={() => setMode('diffuse')}>Difusa</button>
      </div>
      <svg key={mode} className="ttypes-svg" viewBox="0 0 320 130" role="img" aria-label={diffuse ? 'Rayos paralelos que salen en todas direcciones' : 'Rayos paralelos que salen paralelos'}>
        {diffuse ? <polyline points={BUMPS} fill="none" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" opacity=".8" /> : <line x1="10" y1="110" x2="310" y2="110" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" opacity=".85" />}
        {HITS.map((x, i) => (
          <g key={x}>
            <path className="draw" pathLength="1" d={`M${x - 55} 12 L${x} 110`} fill="none" stroke="var(--c)" strokeWidth="3" strokeLinecap="round" style={{ '--d': `${i*120}ms` }} />
            {reflected[i].map(([ex, ey], j) => <path key={j} className="draw" pathLength="1" d={`M${x} 110 L${ex} ${ey}`} fill="none" stroke="var(--c)" strokeWidth="3" strokeLinecap="round" opacity=".7" style={{ '--d': `${500 + i*120 + j*80}ms` }} />)}
            <circle cx={x} cy="110" r="3.5" fill="var(--c)" />
          </g>
        ))}
      </svg>
      <AnimatePresence mode="wait">
        <motion.p key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {diffuse
            ? 'En superficies rugosas (pared, papel) los rayos salen en todas direcciones y no se forma imagen. Por eso podemos ver los objetos desde cualquier lugar.'
            : 'En superficies lisas (espejo, agua tranquila) los rayos reflejados salen paralelos y se forma una imagen nítida.'}
        </motion.p>
      </AnimatePresence>
      <small>{examples}</small>
    </div>
  )
}

/** Denser medium: ray gets closer to the normal; less dense medium: it moves away. */
export function Direction() {
  const toWater = toDegrees(Math.asin(Math.sin(Math.PI/4)/1.33)), toAir = toDegrees(Math.asin(1.33*Math.sin(Math.PI/6)))
  return (
    <div className="tdir">
      <figure>
        <SnellFigure a1={45} a2={toWater} top="aire · n = 1" bottom="agua · n = 1,33" labels={['45°', `${Math.round(toWater)}°`]} shade="bottom" />
        <figcaption><b>Mayor n</b> (aire → agua): la luz <b>se frena</b> y <b>se acerca</b> a la normal.</figcaption>
      </figure>
      <figure>
        <SnellFigure a1={30} a2={toAir} top="agua · n = 1,33" bottom="aire · n = 1" labels={['30°', `${Math.round(toAir)}°`]} />
        <figcaption><b>Menor n</b> (agua → aire): la luz <b>se acelera</b> y <b>se aleja</b> de la normal.</figcaption>
      </figure>
    </div>
  )
}

/** Bars proportional to n for each medium, with the speed of light in it (v = c / n). */
export function IndexBars() {
  const max = INDEX_ROWS.at(-1).n
  return (
    <div className="tbars" aria-label={`Índice de refracción y velocidad de la luz. c = ${LIGHT_SPEED_KM} km/s`}>
      <p className="tbars-c">c = {LIGHT_SPEED_KM} km/s</p>
      {INDEX_ROWS.map((row, i) => (
        <div className="tbar" key={row.name}>
          <span className="tbar-name">{row.name}</span>
          <span className="tbar-track"><motion.i initial={{ width: 0 }} animate={{ width: `${(row.n/max)*100}%` }} transition={{ duration: 0.8, delay: 0.2 + i*0.12, ease: EASE }} /></span>
          <span className="tbar-n">n = {row.label}</span>
          <span className="tbar-v">{row.speed} km/s</span>
        </div>
      ))}
    </div>
  )
}

/** Snell's law worked example: the question, the steps one after another and the diagram. */
export function WorkedExample() {
  const example = SNELL_EXAMPLE
  return (
    <div className="tex">
      <p className="tex-q">{example.question}</p>
      <div className="tex-body">
        <ol className="tex-steps">
          {example.steps.map((step, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i*0.18, duration: 0.5, ease: EASE }}>
              <i aria-hidden="true">{i + 1}</i><span>{step.text}<code>{step.math}</code></span>
            </motion.li>
          ))}
        </ol>
        <motion.div className="tex-fig" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.6, ease: EASE }}>
          <SnellFigure a1={example.a1} a2={example.a2} top="aire · n = 1" bottom="agua · n = 1,33" labels={['30°', `${Math.round(example.a2)}°`]} shade="bottom" />
        </motion.div>
      </div>
      <motion.p className="tex-ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.5, ease: EASE }}>
        <Icon name="check" size={18} /> {example.conclusion}
      </motion.p>
    </div>
  )
}

/** Everyday examples of refraction. */
export function Daily({ items, more }) {
  return (
    <div className="tdaily">
      <ul>{items.map((item, i) => (
        <motion.li key={item.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i*0.12, duration: 0.45, ease: EASE }}><b>{item.title}</b><span>{item.text}</span></motion.li>
      ))}</ul>
      <small>{more} <a href="#aplicaciones">Ver aplicaciones</a></small>
    </div>
  )
}
