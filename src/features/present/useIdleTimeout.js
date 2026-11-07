import { useEffect, useState } from 'react'

const ACTIVITY_EVENTS = ['pointermove', 'pointerdown', 'keydown', 'touchstart']

/** True after `delay` ms without user activity; only counts while `active` (otherwise always false). */
export function useIdleTimeout(active, delay = 3000) {
  const [idle, setIdle] = useState(false)
  useEffect(() => {
    let timer = 0
    const wake = () => { setIdle(false); clearTimeout(timer); if (active) timer = setTimeout(() => setIdle(true), delay) }
    wake()
    ACTIVITY_EVENTS.forEach((name) => addEventListener(name, wake, { passive: true }))
    return () => { clearTimeout(timer); ACTIVITY_EVENTS.forEach((name) => removeEventListener(name, wake)) }
  }, [active, delay])
  return idle
}
