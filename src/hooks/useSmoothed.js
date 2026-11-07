import { useEffect, useRef, useState } from 'react'

/** Follows `target` with an easing, so geometry driven by sliders glides instead of jumping. Jumps when reduced motion is on. */
export function useSmoothed(target, rate = 0.16) {
  const [value, setValue] = useState(target)
  const frame = useRef(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(target); return }
    const step = () => {
      let done = false
      setValue((current) => {
        const next = current + (target - current)*rate
        done = Math.abs(target - next) < 0.001
        return done ? target : next
      })
      if (!done) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target, rate])
  return value
}
