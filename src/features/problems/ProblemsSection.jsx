import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Reveal, SectionHead } from '../../components/ui'
import { PROBLEMS } from '../../content/problems.js'
import { PROBLEM_IMAGES } from './problemImages.js'
import ProblemFigure from './ProblemFigure.jsx'

const EASE = [0.23, 1, 0.32, 1]

/** True while the presentation mode is on (it adds the `expo` class to the root element). */
function useExpoActive() {
  const [active, setActive] = useState(() => document.documentElement.classList.contains('expo'))
  useEffect(() => {
    const root = document.documentElement, observer = new MutationObserver(() => setActive(root.classList.contains('expo')))
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return active
}

/** One worked step: number, title, text and optional formula. */
function Step({ step, index, latest, stagger }) {
  return (
    <motion.li className={'prb-step' + (latest ? ' latest' : '')} initial={{ opacity: 0, x: 28, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE, delay: stagger ? index*0.09 : 0 }}>
      <i aria-hidden="true">{index + 1}</i>
      <div>
        <h4>{step.title}</h4>
        <p>{step.text}</p>
        {step.formula && <span className="eq">{step.formula}</span>}
      </div>
    </motion.li>
  )
}

/** Final card with the marked option. */
function Answer({ problem, index }) {
  const option = problem.options.find((item) => item.key === problem.answer)
  return (
    <motion.li className="prb-ans" initial={{ opacity: 0, y: 18, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: EASE }}>
      <span className="prb-key" aria-hidden="true">{option.key})</span>
      <div><small>Respuesta</small><strong>{option.text}</strong><p>{problem.result}</p></div>
    </motion.li>
  )
}

/**
 * Solved problems: the statement image on the left and the worked solution on the right. Outside the presentation the whole
 * solution is visible (or step by step with the buttons); while presenting, every click reveals the next step.
 */
export default function ProblemsSection() {
  const [current, setCurrent] = useState(0), [shown, setShown] = useState(0), [guided, setGuided] = useState(false)
  const expo = useExpoActive(), section = useRef(null), list = useRef(null)
  const problem = PROBLEMS[current], total = problem.steps.length + 1   // the last item is the answer card
  const stepped = expo || guided, visible = stepped ? shown : total
  const latest = useRef({}); latest.current = { current, shown, total }

  const pick = (index) => { setCurrent(index); setShown(stepped ? 0 : PROBLEMS[index].steps.length + 1) }

  // Presentation hooks: `expo:enter` starts at the first problem, `expo:step` shows one more step (then the next problem)
  useEffect(() => {
    const isCurrent = () => document.documentElement.classList.contains('expo') && section.current?.classList.contains('expo-cur')
    const onEnter = () => { if (!isCurrent()) return; setGuided(false); setCurrent(0); setShown(0) }
    const onStep = (event) => {
      if (!isCurrent()) return
      const { dir } = event.detail, state = latest.current
      if (dir > 0 && state.shown < state.total) setShown(state.shown + 1)
      else if (dir > 0 && state.current < PROBLEMS.length - 1) { setCurrent(state.current + 1); setShown(0) }
      else if (dir < 0 && state.shown > 0) setShown(state.shown - 1)
      else if (dir < 0 && state.current > 0) { setCurrent(state.current - 1); setShown(PROBLEMS[state.current - 1].steps.length + 1) }
      else return
      event.detail.handled = true
    }
    addEventListener('expo:enter', onEnter); addEventListener('expo:step', onStep)
    return () => { removeEventListener('expo:enter', onEnter); removeEventListener('expo:step', onStep) }
  }, [])

  // Keep the newest step in view while revealing step by step
  useEffect(() => {
    if (stepped && visible > 0) list.current?.children[visible - 1]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [visible, current, stepped])

  const items = [...problem.steps.map((step, i) => ({ step, i })), { answer: true, i: problem.steps.length }].slice(0, visible)
  return (
    <section id="problemas" ref={section} data-expo-steps="custom"><div className="wrap">
      <SectionHead tag="Problemas resueltos" title="Practica y comprueba" lead="Tres problemas de refracción en prismas, resueltos paso a paso. Elige uno y mira cómo se dibuja la solución sobre la figura." />
      <Reveal>
        <div className="prb-tabs" role="tablist" aria-label="Problemas">
          {PROBLEMS.map((item, i) => (
            <button key={item.id} type="button" role="tab" aria-selected={i === current} className={'prb-tab' + (i === current ? ' on' : '')} onClick={() => pick(i)}>
              {i === current && <motion.i layoutId="prb-tabbg" className="prb-tabbg" />}
              <b>Problema {item.id}</b><span>{item.who}</span>
            </button>
          ))}
        </div>
      </Reveal>
      <AnimatePresence mode="wait">
        <motion.div key={problem.id} className="prb-grid" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: EASE }}>
          <div className="prb-left">
            <figure className="prb-img">
              <ProblemFigure problem={problem} src={PROBLEM_IMAGES[problem.id]} visible={visible} />
              <figcaption>{problem.title}</figcaption>
            </figure>
          </div>
          <div className="prb-sol">
            <div className="prb-ctl">
              {!guided
                ? <button type="button" className="btn ghost sm" onClick={() => { setGuided(true); setShown(0) }}>Resolver paso a paso</button>
                : <>
                    <button type="button" className="btn sm" disabled={shown >= total} onClick={() => setShown((count) => Math.min(total, count + 1))}>Siguiente paso ({Math.min(shown, total)}/{total})</button>
                    <button type="button" className="btn ghost sm" onClick={() => { setGuided(false); setShown(total) }}>Ver todo</button>
                  </>}
            </div>
            <ol className="prb-steps" ref={list} aria-live="polite">
              {items.map((item) => item.answer
                ? <Answer key={problem.id + '-answer'} problem={problem} index={item.i} />
                : <Step key={problem.id + '-' + item.i} step={item.step} index={item.i} latest={stepped && item.i === visible - 1} stagger={!stepped} />)}
            </ol>
            {stepped && shown === 0 && <p className="prb-hint">{expo ? 'Haz clic para mostrar el primer paso.' : 'Pulsa «Siguiente paso» para empezar.'}</p>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div></section>
  )
}
