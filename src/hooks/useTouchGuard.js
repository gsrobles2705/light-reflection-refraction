import { useEffect, useRef } from 'react'

/**
 * On touch screens, blocks page scrolling only when the finger lands on an interactive handle of the canvas
 * (`isHandleAt(clientX, clientY)` returns true). Everywhere else the page scrolls normally, so a canvas never
 * becomes a scroll trap. Needs a non-passive listener, which React props can't register.
 */
export function useTouchGuard(canvasRef, isHandleAt) {
  const predicate = useRef(isHandleAt)
  predicate.current = isHandleAt
  useEffect(() => {
    const canvas = canvasRef.current
    const onTouchStart = (event) => {
      const touch = event.touches[0]
      if (predicate.current(touch.clientX, touch.clientY)) event.preventDefault()
    }
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    return () => canvas.removeEventListener('touchstart', onTouchStart)
  }, [canvasRef])
}
