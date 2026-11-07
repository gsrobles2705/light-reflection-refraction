import { useEffect, useRef } from 'react'

/** Vertical position (fraction of the viewport) at which a step counts as "the one being read". */
const READING_LINE = 0.55

/**
 * Tells which guided step is closest to the reading line while the section is on screen, and calls
 * `onStepChange(index)` when it changes. Recomputed on every scroll frame, so it never depends on a card
 * crossing a narrow observation band. Scroll events are captured from any container (presentation-mode slides
 * scroll internally instead of the window).
 */
export function usePrismScrollStory({ sectionRef, stepRefs, onStepChange }) {
  const lastStep = useRef(-1), handler = useRef(onStepChange)
  handler.current = onStepChange
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const section = sectionRef.current
      if (!section) return
      const bounds = section.getBoundingClientRect()
      if (bounds.bottom < 0 || bounds.top > innerHeight) return
      const line = innerHeight * READING_LINE
      let best = -1, bestDistance = Infinity
      stepRefs.current.forEach((element, i) => {
        if (!element) return
        const rect = element.getBoundingClientRect(), distance = Math.abs(rect.top + rect.height / 2 - line)
        if (distance < bestDistance) { bestDistance = distance; best = i }
      })
      if (best >= 0 && best !== lastStep.current) { lastStep.current = best; handler.current(best) }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    addEventListener('scroll', schedule, { passive: true, capture: true })
    addEventListener('resize', schedule)
    schedule()
    return () => { removeEventListener('scroll', schedule, { capture: true }); removeEventListener('resize', schedule); cancelAnimationFrame(frame) }
  }, [sectionRef, stepRefs])
}
