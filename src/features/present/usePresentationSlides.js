import { useEffect, useRef, useState } from 'react'
import { NAV_ITEMS } from '../../content/navigation.js'

/** Space reserved at the bottom of a slide for the toolbar, and the largest overflow that is shrunk to fit. */
const TOOLBAR_RESERVE = 104
const SLIDE_PADDING = 24
const MAX_FIT_RATIO = 1.5
const MIN_ZOOM = 0.62
const READING_LINE = 0.35
/** Sections with their own compact layout; shrinking them with zoom would make them tiny. */
const NEVER_ZOOM = new Set(['simulador', 'historia'])
/** Interactive slides: a click on empty space reveals the next block but never leaves the slide. */
const STAY_ON_CLICK = new Set(['prisma', 'experimento', 'simulador'])

const listSections = () => [...document.querySelectorAll('main > section')]
/** Blocks of a slide that appear one by one: top-level reveal wrappers, except the section heading. */
const unitsOf = (section) => !section || section.dataset.expoSteps === 'custom' ? [] :
  [...section.querySelectorAll('.rv')].filter((element) => !element.parentElement.closest('.rv') && !element.querySelector(':scope > .tag'))

/**
 * Presentation mode: one page section ("slide") is shown at a time, full screen, vertically centered with room for the
 * toolbar. Slides are the `<main>` sections themselves; the active one gets the `.expo-cur` class (see the CSS), so
 * all components keep working unchanged inside a slide.
 */
export function usePresentationSlides() {
  const [presenting, setPresenting] = useState(false)
  const [slide, setSlide] = useState(0)
  const [info, setInfo] = useState({ count: 1, name: '' })
  const readingIndex = useRef(0), slideRef = useRef(0), previousSlide = useRef(-1)
  slideRef.current = slide

  useEffect(() => { document.documentElement.classList.toggle('expo', presenting) }, [presenting])

  // Outside the presentation, track which section is being read so the presentation starts where the reader is
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      if (document.documentElement.classList.contains('expo')) return
      const sections = listSections(), line = innerHeight * READING_LINE
      let index = sections.findIndex((element) => { const rect = element.getBoundingClientRect(); return rect.top <= line && rect.bottom > line })
      if (index < 0) index = scrollY < 100 ? 0 : sections.length - 1
      readingIndex.current = index
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    addEventListener('scroll', schedule, { passive: true }); addEventListener('resize', schedule); schedule()
    return () => { removeEventListener('scroll', schedule); removeEventListener('resize', schedule); cancelAnimationFrame(frame) }
  }, [])

  /** Shrinks a slightly-too-tall slide so it fits above the toolbar; taller slides scroll inside the slide instead. */
  const fitCurrentSlide = () => {
    const element = listSections()[slideRef.current]
    if (!element || !document.documentElement.classList.contains('expo') || NEVER_ZOOM.has(element.id)) return
    element.style.zoom = ''
    const available = innerHeight - SLIDE_PADDING - TOOLBAR_RESERVE
    const height = [...element.children].reduce((total, child) => total + child.getBoundingClientRect().height, 0)
    if (height > available && height <= available * MAX_FIT_RATIO) element.style.zoom = Math.max(MIN_ZOOM, available / height).toFixed(3)
  }

  useEffect(() => {
    const sections = listSections()
    sections.forEach((element, i) => {
      const isCurrent = presenting && i === slide
      element.classList.toggle('expo-cur', isCurrent)
      if (!isCurrent) element.style.zoom = ''
    })
    const current = sections[slide]
    // Prepare the step-by-step blocks: going forward starts with them hidden, going back shows the slide complete
    document.querySelectorAll('.step-unit').forEach((element) => element.classList.remove('step-unit', 'step-in'))
    if (presenting) {
      const showAll = slide < previousSlide.current
      unitsOf(current).forEach((element) => { element.classList.add('step-unit'); element.classList.toggle('step-in', showAll) })
      previousSlide.current = slide
    } else previousSlide.current = -1
    setInfo({ count: sections.length, name: NAV_ITEMS.find((item) => item.id === current?.id)?.label || current?.querySelector('h1,h2')?.textContent || '' })
    if (!presenting) return
    const frame = requestAnimationFrame(() => { fitCurrentSlide(); current?.focus({ preventScroll: true }); dispatchEvent(new CustomEvent('expo:enter', { detail: { id: current?.id } })) })   // focus lets arrow/space keys scroll inside the slide
    const later = setTimeout(fitCurrentSlide, 500)   // entrance animations may change the height
    return () => { cancelAnimationFrame(frame); clearTimeout(later) }
  }, [presenting, slide])

  useEffect(() => {
    if (!presenting) return
    addEventListener('resize', fitCurrentSlide)
    document.addEventListener('fullscreenchange', fitCurrentSlide)
    return () => { removeEventListener('resize', fitCurrentSlide); document.removeEventListener('fullscreenchange', fitCurrentSlide) }
  }, [presenting])

  useEffect(() => { listSections().forEach((element) => { if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '-1') }) }, [])

  /**
   * One step inside the slide (dir 1 forward, -1 back): a component that owns its own steps (history) handles the
   * `expo:step` event first, otherwise the next block appears. With nothing left to reveal it changes slide.
   */
  const step = (dir, { fromClick = false } = {}) => {
    const sections = listSections(), section = sections[slideRef.current]
    if (!section) return
    const detail = { dir, handled: false }
    dispatchEvent(new CustomEvent('expo:step', { detail }))
    if (detail.handled) return
    const units = unitsOf(section), shown = units.filter((element) => element.classList.contains('step-in'))
    if (dir > 0 && shown.length < units.length) { const next = units[shown.length]; next.classList.add('step-in'); next.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }
    else if (dir < 0 && shown.length) shown[shown.length - 1].classList.remove('step-in')
    else if (!(fromClick && STAY_ON_CLICK.has(section.id))) setSlide((index) => Math.min(Math.max(0, index + dir), sections.length - 1))
  }

  return {
    presenting,
    step,
    slide,
    count: info.count,
    name: info.name,
    goTo: (index) => setSlide(Math.min(Math.max(0, index), Math.max(0, listSections().length - 1))),
    start() { setSlide(readingIndex.current); setPresenting(true) },
    /** Ends the presentation and scrolls the normal page back to the slide that was showing. */
    stop() {
      const index = slideRef.current
      setPresenting(false)
      requestAnimationFrame(() => requestAnimationFrame(() => listSections()[index]?.scrollIntoView({ block: 'start', behavior: 'auto' })))
    },
  }
}
