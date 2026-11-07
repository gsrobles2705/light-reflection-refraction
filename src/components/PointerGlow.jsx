import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

const HALF_SIZE = 220   // the glow element is 440 px wide

/** Soft light that follows the cursor. Not rendered on touch screens or with prefers-reduced-motion. Styled via #glow. */
export default function PointerGlow() {
  const element = useRef(), reduceMotion = useReducedMotion()
  const enabled = !reduceMotion && typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches
  useEffect(() => {
    if (!enabled) return
    let frame = 0, x = 0, y = 0
    const paint = () => { frame = 0; element.current.style.transform = `translate3d(${x - HALF_SIZE}px,${y - HALF_SIZE}px,0)` }
    const follow = (event) => { x = event.clientX; y = event.clientY; if (!frame) frame = requestAnimationFrame(paint) }
    addEventListener('pointermove', follow, { passive: true })
    return () => { removeEventListener('pointermove', follow); cancelAnimationFrame(frame) }
  }, [enabled])
  return enabled ? <div id="glow" ref={element} aria-hidden="true" /> : null
}
