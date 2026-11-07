import { useEffect, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { useFullscreen } from './useFullscreen.js'
import { useIdleTimeout } from './useIdleTimeout.js'
import { usePresentationKeys } from './usePresentationKeys.js'
import { usePresentationSlides } from './usePresentationSlides.js'
import { usePresentationTimer } from './usePresentationTimer.js'

/** Clicks on these never advance the slide. */
const NO_ADVANCE = 'a,button,input,select,textarea,label,summary,canvas,video,[role=tab],[role=slider],[role=switch],[contenteditable],.noadvance'

/** Collapsed launcher: one round button that opens a small menu with the two presentation options. */
function LaunchMenu({ open, onToggle, fullscreen, onFullscreen, onPresent }) {
  return (
    <div className="exlaunch">
      <button type="button" className="exfab" aria-haspopup="true" aria-expanded={open} aria-controls="exmenu" aria-label="Opciones de presentación" title="Presentar" onClick={onToggle}>
        <Icon name={open ? 'close' : 'screen'} size={20} />
      </button>
      {open && (
        <div id="exmenu" className="exmenu" role="group" aria-label="Opciones de presentación">
          {fullscreen.supported && <button type="button" onClick={onFullscreen} aria-pressed={fullscreen.isFullscreen}><Icon name="expand" size={18} />{fullscreen.isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} <kbd>F</kbd></button>}
          <button type="button" onClick={onPresent}><Icon name="screen" size={18} />Modo exposición <kbd>P</kbd></button>
        </div>
      )}
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

  // While presenting, a click on empty space of the slide shows its next part (controls keep their own behavior)
  useEffect(() => {
    if (!slides.presenting) return
    const onClick = (event) => {
      const target = event.target
      if (event.button !== 0 || !target.closest?.('main>section.expo-cur') || target.closest?.(NO_ADVANCE) || getSelection()?.toString()) return
      slides.step(1, { fromClick: true })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [slides.presenting])

  // Clicking anywhere outside the toolbar closes the launcher menu
  useEffect(() => {
    if (!menuOpen) return
    const closeOnOutsideClick = (event) => { if (!event.target.closest?.('#expobar')) setMenuOpen(false) }
    addEventListener('pointerdown', closeOnOutsideClick)
    return () => removeEventListener('pointerdown', closeOnOutsideClick)
  }, [menuOpen])

  const hidden = idle && (slides.presenting || fullscreen.isFullscreen)
  return (
    <div id="expobar" className={(slides.presenting ? 'expo ' : '') + (hidden ? 'idle' : '')} role="toolbar" aria-label="Herramientas de exposición">
      {slides.presenting
        ? <PresentationControls slides={slides} timer={timer} onLeave={leavePresentation} />
        : <LaunchMenu open={menuOpen} onToggle={() => setMenuOpen((open) => !open)} fullscreen={fullscreen} onFullscreen={() => { setMenuOpen(false); fullscreen.toggle() }} onPresent={togglePresentation} />}
    </div>
  )
}
