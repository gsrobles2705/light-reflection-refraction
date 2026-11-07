import { useEffect, useRef } from 'react'

const DEGREES_PER_SECOND = 14

/** While `playing`, sweeps the angle back and forth between `min` and `max`, reporting each step through `onAngle`. */
export function useAngleSweep({ playing, angle, onAngle, min = 0, max = 89 }) {
  const latest = useRef({ angle, onAngle })
  latest.current = { angle, onAngle }
  const direction = useRef(1)
  useEffect(() => {
    if (!playing) return
    let last = performance.now(), handle = 0
    const tick = (now) => {
      const deltaSeconds = (now - last) / 1000
      last = now
      let next = latest.current.angle + direction.current * DEGREES_PER_SECOND * deltaSeconds
      if (next >= max) { next = max; direction.current = -1 } else if (next <= min) { next = min; direction.current = 1 }
      latest.current.onAngle(Math.round(next * 10) / 10)
      handle = requestAnimationFrame(tick)
    }
    handle = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(handle)
  }, [playing, min, max])
}
