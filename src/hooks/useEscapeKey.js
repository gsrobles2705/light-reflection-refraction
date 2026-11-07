import { useEffect } from 'react'

/** Calls `handler` when Escape is pressed (only while `enabled`). */
export function useEscapeKey(handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event) => event.key === 'Escape' && handler()
    addEventListener('keydown', onKeyDown)
    return () => removeEventListener('keydown', onKeyDown)
  }, [handler, enabled])
}
