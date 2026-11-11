import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Icon from '../../components/Icon.jsx'
import { useFullscreen } from './useFullscreen.js'
import { useIdleTimeout } from './useIdleTimeout.js'
import { usePresentationKeys } from './usePresentationKeys.js'
import { usePresentationSlides } from './usePresentationSlides.js'
import { usePresentationTimer } from './usePresentationTimer.js'

/** Clicks on these never advance the slide. */
const NO_ADVANCE = 'a,button,input,select,textarea,label,summary,canvas:not(.hero-cv),video,[role=tab],[role=slider],[role=switch],[role=combobox],[role=option],[contenteditable],.noadvance'

/** A press that moves more than this (px) is a drag, not a click; two clicks closer than this (ms) count as one. */
const CLICK_DRAG_TOLERANCE = 6
const DOUBLE_CLICK_GUARD = 280
const HINT_MS = 6000
/** After clicking one of these the focus is released, so Space / Enter move the slide instead of pressing the same control again. */
const CONTROLS_THAT_RELEASE_FOCUS = 'button,a,summary,label,[role=tab],[role=option]'

/** A swipe must travel this far (px) and be mostly horizontal; it is ignored on elements that handle horizontal gestures themselves. */
const SWIPE_DISTANCE = 70
const SWIPE_BLOCKED = 'canvas,input,select,textarea,[role=slider],[role=listbox],[role=tab],[role=tablist],.noswipe,#expobar'

/** Collapsed launcher: one round button that opens a small menu with the two presentation options. */
function LaunchMenu({ open, onToggle, fullscreen, onFullscreen, onPresent }) {
  return (
    <div className="exlaunch">
      <button type="button" className="exfab" aria-haspopup="true" aria-expanded={open} aria-controls="exmenu" aria-label="Opciones de presentación" title="Presentar" onClick={onToggle}>
        <Icon name={open ? 'close' : 'screen'} size={20} />
        <span className="exfab-txt" aria-hidden="true">Exponer <kbd>P</kbd></span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div id="exmenu" className="exmenu" role="group" aria-label="Opciones de presentación"
            initial={{ opacity: 0, y: 10, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>
            {fullscreen.supported && <button type="button" onClick={onFullscreen} aria-pressed={fullscreen.isFullscreen}><Icon name="expand" size={18} />{fullscreen.isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} <kbd>F</kbd></button>}
            <button type="button" onClick={onPresent}><Icon name="screen" size={18} />Modo exposición <kbd>P</kbd></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Toolbar shown while presenting: previous/next, position, progress dots, stopwatch and exit. */
function PresentationControls({ slides, timer, onLeave }) {
  const { slide, count, name, goTo } = slides
  return (
    <>
      <button type="button" className="ebtn" onClick={() => goTo(slide - 1)} disabled={slide === 0} aria-label="Diapositiva anterior"><Icon name="left" size={18} /></button>
      <span className="expoind" aria-live="polite"><b>{slide + 1}/{count}</b><em>{name}</em></span>
      <button type="button" className="ebtn" onClick={() => goTo(slide + 1)} disabled={slide === count - 1} aria-label="Diapositiva siguiente"><Icon name="right" size={18} /></button>
      <button type="button" className="ebtn estep" onClick={() => slides.step(1)} aria-label="Mostrar la siguiente parte (clic, Espacio o Enter)" title="Siguiente parte · clic, Espacio o Enter"><Icon name="next" size={18} /></button>
      <span className="expoprog" role="group" aria-label="Ir a una diapositiva">
        {Array.from({ length: count }, (_, i) => <button key={i} type="button" className={i === slide ? 'on' : i < slide ? 'done' : ''} onClick={() => goTo(i)} aria-label={`Diapositiva ${i + 1}`} aria-current={i === slide} />)}
      </span>
      {timer.visible && (
        <span className="expotimer">
          <button type="button" onClick={timer.toggleRunning} aria-label={timer.running ? 'Pausar cronómetro' : 'Iniciar cronómetro'}><Icon name={timer.running ? 'pause' : 'play'} size={14} /><b>{timer.label}</b></button>
        </span>
      )}
      <button type="button" className="ebtn expoexit" onClick={onLeave} aria-label="Salir del modo exposición (Esc)"><Icon name="close" size={16} /></button>
    </>
  )
}

/**
 * Presentation tools. Presentation mode = fullscreen + one slide at a time. The toolbar hides itself after 3 s without
 * activity (move the mouse to bring it back).
 */
export default function PresentBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const slides = usePresentationSlides(), timer = usePresentationTimer()
  const fullscreen = useFullscreen({ onExitedPresentationFullscreen: slides.stop })
  const idle = useIdleTimeout(slides.presenting || fullscreen.isFullscreen)

  const leavePresentation = () => { slides.stop(); fullscreen.exitIfOwnedByPresentation() }
  const startPresentation = () => { slides.start(); fullscreen.enterForPresentation() }
  const togglePresentation = () => { setMenuOpen(false); slides.presenting ? leavePresentation() : startPresentation() }

  usePresentationKeys({
    presenting: slides.presenting, menuOpen,
    actions: {
      togglePresentation, toggleFullscreen: fullscreen.toggle, toggleTimer: timer.toggleVisible, closeMenu: () => setMenuOpen(false), leavePresentation,
      previous: () => slides.goTo(slides.slide - 1), step: slides.step, next: () => slides.goTo(slides.slide + 1), first: () => slides.goTo(0), last: () => slides.goTo(Infinity),
    },
  })

  // While presenting, a click (or tap) on empty space shows the next part of the slide, exactly like Space. Controls keep their own
  // behavior, a drag is not a click, double clicks do not skip a part, and a pressed control gives the keyboard back to the slide.
  useEffect(() => {
    if (!slides.presenting) return
    let down = null, lastAdvance = 0
    const onPointerDown = (event) => { down = { x: event.clientX, y: event.clientY } }
    const onClick = (event) => {
      const target = event.target, section = target.closest?.('main>section.expo-cur')
      const dragged = down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > CLICK_DRAG_TOLERANCE
      down = null
      if (target.closest?.(CONTROLS_THAT_RELEASE_FOCUS) && !target.closest?.('#expobar')) setTimeout(() => document.activeElement?.blur?.(), 0)
      if (event.button !== 0 || !section || dragged || target.closest?.(NO_ADVANCE) || getSelection()?.toString()) return
      if (event.timeStamp - lastAdvance < DOUBLE_CLICK_GUARD) return
      lastAdvance = event.timeStamp
      // Interactive slides only leave on a click in truly empty space, so a click while using a tool never skips the slide
      const emptySpace = target === section || target.classList.contains('wrap') || target.classList.contains('head')
      slides.step(1, { fromClick: !emptySpace })
    }
    document.addEventListener('pointerdown', onPointerDown, true); document.addEventListener('click', onClick)
    return () => { document.removeEventListener('pointerdown', onPointerDown, true); document.removeEventListener('click', onClick) }
  }, [slides.presenting])

  // A short reminder of how to move on, shown when the presentation starts
  const [hint, setHint] = useState(false)
  useEffect(() => {
    if (!slides.presenting) { setHint(false); return }
    setHint(true)
    const timeout = setTimeout(() => setHint(false), HINT_MS)
    return () => clearTimeout(timeout)
  }, [slides.presenting])

  // Touch screens: a horizontal swipe on the slide changes slide (swipes on canvases, sliders and scrollable strips keep their own meaning)
  useEffect(() => {
    if (!slides.presenting) return
    let start = null
    const onTouchStart = (event) => {
      const touch = event.touches[0]
      start = event.touches.length === 1 && !event.target.closest?.(SWIPE_BLOCKED) ? { x: touch.clientX, y: touch.clientY, time: Date.now() } : null
    }
    const onTouchEnd = (event) => {
      if (!start) return
      const touch = event.changedTouches[0], dx = touch.clientX - start.x, dy = touch.clientY - start.y, quick = Date.now() - start.time < 700
      start = null
      if (quick && Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)*1.6 && !getSelection()?.toString()) slides.goTo(slides.slide + (dx < 0 ? 1 : -1))
    }
    document.addEventListener('touchstart', onTouchStart, { passive: true }); document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => { document.removeEventListener('touchstart', onTouchStart); document.removeEventListener('touchend', onTouchEnd) }
  }, [slides.presenting, slides.slide])

  // Clicking anywhere outside the toolbar closes the launcher menu
  useEffect(() => {
    if (!menuOpen) return
    const closeOnOutsideClick = (event) => { if (!event.target.closest?.('#expobar')) setMenuOpen(false) }
    addEventListener('pointerdown', closeOnOutsideClick)
    return () => removeEventListener('pointerdown', closeOnOutsideClick)
  }, [menuOpen])

  const hidden = idle && (slides.presenting || fullscreen.isFullscreen)
  return (
    <>
    <div id="expobar" className={(slides.presenting ? 'expo ' : '') + (hidden ? 'idle' : '')} role="toolbar" aria-label="Herramientas de exposición">
      {slides.presenting
        ? <PresentationControls slides={slides} timer={timer} onLeave={leavePresentation} />
        : <LaunchMenu open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} fullscreen={fullscreen} onFullscreen={() => { setMenuOpen(false); fullscreen.toggle() }} onPresent={togglePresentation} />}
    </div>
    {hint && <p className="exhint" role="status"><b>Clic o Espacio</b> para avanzar · <b>←</b> <b>→</b> para cambiar de diapositiva · <b>Esc</b> para salir</p>}
    </>
  )
}
