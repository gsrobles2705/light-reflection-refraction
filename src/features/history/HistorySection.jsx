import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Diagram from '../../components/Diagram.jsx'
import { Reveal, SectionHead } from '../../components/ui'
import { COMPLEMENT, LANES, TOPIC_LABEL, eventsOf } from '../../content/history.js'
import HistoryFigure from './HistoryFigure.jsx'

const EASE = [0.23, 1, 0.32, 1]
/** Scroll story geometry: rail item height and scroll distance per event (in vh). */
const ITEM_H = 92, STEP_VH = 55

const cardVariants = {
  enter: (dir) => ({ opacity: 0, y: 36*dir, scale: 0.98 }),
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE, staggerChildren: 0.08 } },
  exit: (dir) => ({ opacity: 0, y: -28*dir, scale: 0.98, transition: { duration: 0.22 } }),
}
const kidVariants = { enter: { opacity: 0, y: 18 }, center: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }
const figVariants = { enter: { opacity: 0, scale: 0.88, rotate: -2 }, center: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.65, ease: EASE } } }

/** The element that scrolls the story: the active slide while presenting, the page otherwise. */
const scrollerOf = (element) => document.documentElement.classList.contains('expo') ? element.closest('main>section') : null

/**
 * Scroll story: the card stays in place while the timeline rail slides past a fixed marker. Scrolling moves the rail
 * continuously and swaps the card with an animation; clicking an item scrolls to it. `controls` exposes goTo/active
 * so the presentation mode can step through the events.
 */
function ScrollStory({ events, controls }) {
  const wrap = useRef(null), stage = useRef(null), activeRef = useRef(0), dirRef = useRef(1), targetRef = useRef(null)
  const [pos, setPos] = useState(0)
  const reduceMotion = useReducedMotion(), last = events.length - 1
  const active = Math.round(pos), event = events[active], following = events[active + 1]
  const range = () => last*innerHeight*STEP_VH/100
  const stickyTop = () => parseFloat(getComputedStyle(stage.current).top) || 0

  const goTo = (i, instant = false) => {
    const index = Math.min(last, Math.max(0, i)), element = wrap.current
    targetRef.current = index
    const delta = element.getBoundingClientRect().top - (stickyTop() - (index/last)*range()) + 2
    const options = { top: delta, behavior: instant || reduceMotion ? 'auto' : 'smooth' }
    const scroller = scrollerOf(element)
    if (scroller) scroller.scrollBy(options); else scrollBy(options)
  }
  controls.current = { goTo, active: () => (targetRef.current ?? activeRef.current), last }

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const element = wrap.current
      if (!element || !element.offsetParent) return   // hidden (phones)
      const p = Math.min(1, Math.max(0, (stickyTop() - element.getBoundingClientRect().top)/range()))*last
      const nearest = Math.round(p)
      if (targetRef.current !== null && Math.abs(p - targetRef.current) < 0.08) targetRef.current = null
      if (nearest !== activeRef.current) { dirRef.current = nearest > activeRef.current ? 1 : -1; activeRef.current = nearest }
      setPos((old) => (Math.abs(old - p) < 0.003 ? old : p))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    // Capture phase: scroll events of the presentation slide do not bubble up to the window
    addEventListener('scroll', schedule, { passive: true, capture: true }); addEventListener('resize', schedule)
    return () => { removeEventListener('scroll', schedule, true); removeEventListener('resize', schedule); cancelAnimationFrame(frame) }
  }, [last])

  return (
    <div className="hscroll" ref={wrap} style={{ height: `calc(var(--hs-h) + ${last*STEP_VH}vh)` }}>
      <div className="hs-stage" ref={stage} style={{ '--c': event.color }}>
        <div className="hs-rail">
          <div className="hs-track" style={{ transform: `translateY(${-(pos*ITEM_H + ITEM_H/2)}px)` }}>
            <i className="hs-line" aria-hidden="true" style={{ top: ITEM_H/2, height: last*ITEM_H }}><b style={{ height: pos*ITEM_H }} /></i>
            {events.map((item, i) => (
              <button key={item.year} type="button" className={'hs-item' + (i === active ? ' on' : '')} aria-current={i === active ? 'step' : undefined} onClick={() => goTo(i)}
                style={{ top: i*ITEM_H, height: ITEM_H, opacity: Math.max(0.25, 1 - Math.abs(i - pos)*0.28), '--c': item.color }}>
                <span className="hs-dot" aria-hidden="true" /><span className="hs-yr">{item.year}</span><span className="hs-nm">{item.who}</span>
              </button>
            ))}
          </div>
          <span className="hs-mark" aria-hidden="true" />
        </div>
        <AnimatePresence mode="wait" custom={dirRef.current}>
          <motion.article key={event.year} className="hs-card" custom={dirRef.current} variants={cardVariants} initial={reduceMotion ? false : 'enter'} animate="center" exit={reduceMotion ? undefined : 'exit'}>
            <motion.div variants={kidVariants} className="hs-head">
              <span className="hs-big" aria-hidden="true">{event.year}</span>
              <span className="hs-meta"><span className="hplace">{event.place}</span><span className={'htopic ' + event.topic}>{TOPIC_LABEL[event.topic]}</span></span>
            </motion.div>
            <div className="hs-body">
              <div className="hs-text">
                <motion.h3 variants={kidVariants}>{event.who}: {event.title}</motion.h3>
                <motion.p variants={kidVariants}>{event.text}</motion.p>
                <motion.p variants={kidVariants} className="hwhy"><b>Por qué importa:</b> {event.why}</motion.p>
                {event.highlight && <motion.span variants={kidVariants} className="hkey">Hecho histórico clave</motion.span>}
              </div>
              <motion.figure variants={figVariants} className="hs-fig">
                <HistoryFigure name={event.figure} label={event.caption} />
                <figcaption>{event.caption}</figcaption>
              </motion.figure>
            </div>
          </motion.article>
        </AnimatePresence>
        <div className="hs-foot" aria-hidden="true">
          <span className="hs-count"><b>{active + 1}</b> / {events.length}</span>
          <span className="hs-hint">
            <i className="hs-mouse"><b /></i>
            {following
              ? <span><span className="only-scroll">Sigue bajando</span><span className="only-expo">Clic o Espacio</span> · siguiente: <b>{following.who}</b> <em>{following.year}</em></span>
              : <span>Última etapa · <span className="only-scroll">sigue bajando</span><span className="only-expo">clic o Espacio</span> para ver el resumen</span>}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Mobile: vertical timeline whose events reveal themselves (and fill the line) as the reader scrolls. */
function VerticalTimeline({ events }) {
  const [revealed, setRevealed] = useState(() => new Set())
  const itemRefs = useRef([]), reduceMotion = useReducedMotion(), last = events.length - 1
  useEffect(() => {
    if (reduceMotion || typeof IntersectionObserver === 'undefined') { setRevealed(new Set(events.map((_, i) => i))); return }
    // Reveal when an event reaches ~78 % of the viewport height; revealed events stay visible
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setRevealed((set) => new Set(set).add(+entry.target.dataset.index))
    }), { rootMargin: '0px 0px -22% 0px', threshold: 0.12 })
    itemRefs.current.forEach((element) => element && observer.observe(element))
    return () => observer.disconnect()
  }, [reduceMotion, events])
  return (
    <ol className="hvert" aria-label="Línea de tiempo">
      {events.map((item, i) => (
        <li key={item.year} ref={(element) => (itemRefs.current[i] = element)} data-index={i} className={(revealed.has(i) ? 'in ' : '') + (item.highlight ? 'key' : '')} style={{ '--c': item.color }}>
          <i className="hv-dot" aria-hidden="true" />{i < last && <i className="hv-line" aria-hidden="true" />}
          <div className="hv-card">
            <span className="hv-year">{item.year}</span>
            <span className="hplace">{item.place}</span><span className={'htopic ' + item.topic}>{TOPIC_LABEL[item.topic]}</span>
            <h3>{item.who}: {item.title}</h3>
            <p>{item.text}</p>
            <p className="hwhy"><b>Por qué importa:</b> {item.why}</p>
            <div className="hv-fig"><HistoryFigure name={item.figure} label={item.caption} /><p>{item.caption}</p></div>
            {item.highlight && <span className="hkey">Hecho histórico clave</span>}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Three story cards that also filter the timeline: everything, only reflection, or only refraction. */
function LanePicker({ lane, onPick }) {
  return (
    <div className="hlanes" role="group" aria-label="Elegir historia">
      {LANES.map((item) => (
        <button key={item.id} type="button" aria-pressed={lane === item.id} className={'hlane ' + (lane === item.id ? 'on' : '')} style={{ '--c': item.color }} onClick={() => onPick(item.id)}>
          <span className="hlane-tag">{item.tag}<b>{eventsOf(item.id).length} hitos</b></span>
          <strong>{item.title}</strong>
          {item.formula && <code>{item.formula}</code>}
          <span className="hlane-hook">{item.hook}</span>
        </button>
      ))}
    </div>
  )
}

/** Complementary summary: how each idea evolved and a worked example drawn with the theory diagrams. */
function Complement({ open, onToggle }) {
  const reduceMotion = useReducedMotion()
  const appear = (delay) => reduceMotion ? {} : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.55, ease: EASE } }
  return (
    <div className={'hfull' + (open ? ' open' : '')}>
      <button type="button" className="hfull-btn" aria-expanded={open} onClick={onToggle}>
        <span>{open ? 'Ocultar el resumen' : 'Para entender mejor: resumen y ejemplos'}</span><i aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" className="hfull-body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}>
            <div className="hcomps">
              {COMPLEMENT.map((lane, i) => (
                <motion.article key={lane.topic} className="hcomp" style={{ '--c': lane.color }} {...appear(0.1 + i*0.15)}>
                  <span className="hstory-tag">{lane.tag}</span>
                  <h3>{lane.title}</h3>
                  <ol className="hflow">
                    {lane.steps.map((step, j) => (
                      <motion.li key={step.who} className={step.wrong ? 'wrong' : ''} {...appear(0.3 + i*0.15 + j*0.1)}>
                        <i aria-hidden="true">{j + 1}</i><span><b>{step.who}</b>{step.idea}</span>
                      </motion.li>
                    ))}
                  </ol>
                  <motion.div className="hcomp-ex" {...appear(0.8 + i*0.15)}>
                    <div className="dpan"><Diagram kind={lane.example.kind} /></div>
                    <div className="hcomp-calc">
                      <strong>Ejemplo</strong>
                      <p>{lane.example.lead}</p>
                      <span className="eq">{lane.example.result}</span>
                      <p>{lane.example.note}</p>
                    </div>
                  </motion.div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** History of reflection and refraction. In presentation mode a click (or Space / Enter) moves to the next event. */
export default function HistorySection() {
  const [lane, setLane] = useState('todas'), [info, setInfo] = useState(false)
  const section = useRef(null), controls = useRef(null), complement = useRef(null), infoRef = useRef(false)
  const events = eventsOf(lane)
  infoRef.current = info

  // Presentation hooks: `expo:enter` puts the first event in place, `expo:step` moves one event (then opens the summary)
  useEffect(() => {
    const isCurrent = () => document.documentElement.classList.contains('expo') && section.current?.classList.contains('expo-cur')
    const onEnter = () => { if (!isCurrent()) return; setInfo(false); requestAnimationFrame(() => controls.current?.goTo(0, true)) }
    const onStep = (event) => {
      const story = controls.current
      if (!isCurrent() || !story) return
      const { dir } = event.detail, at = story.active()
      if (dir > 0 && at < story.last) story.goTo(at + 1)
      else if (dir > 0 && !infoRef.current) { setInfo(true); setTimeout(() => complement.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150) }
      else if (dir < 0 && infoRef.current) { setInfo(false); setTimeout(() => story.goTo(story.last), 150) }
      else if (dir < 0 && at > 0) story.goTo(at - 1)
      else return
      event.detail.handled = true
    }
    addEventListener('expo:enter', onEnter); addEventListener('expo:step', onStep)
    return () => { removeEventListener('expo:enter', onEnter); removeEventListener('expo:step', onStep) }
  }, [])

  return (
    <section id="historia" ref={section} data-expo-steps="custom"><div className="wrap">
      <SectionHead tag="Historia" title="Veinte siglos mirando la luz" lead="Dos historias que se cruzan: primero se entendió cómo rebota la luz y luego cómo se dobla. Elige una y recorre sus descubrimientos." />
      <Reveal><LanePicker lane={lane} onPick={setLane} /></Reveal>
      <ScrollStory key={lane} events={events} controls={controls} />
      <VerticalTimeline key={lane} events={events} />
      <div ref={complement}><Complement open={info} onToggle={() => setInfo((value) => !value)} /></div>
    </div></section>
  )
}
