import { useEffect, useState } from 'react'

/** `useState` persisted in localStorage. Storage failures (private mode, quota) fall back to in-memory state. */
export function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable: keep in memory only */ }
  }, [key, value])
  return [value, setValue]
}
