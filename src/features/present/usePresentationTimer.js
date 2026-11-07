import { useEffect, useState } from 'react'

/** Stopwatch for the presenter (start/pause/reset) with a visibility toggle. */
export function usePresentationTimer() {
  const [state, setState] = useState({ running: false, seconds: 0, visible: true })
  useEffect(() => {
    if (!state.running) return
    const id = setInterval(() => setState((current) => ({ ...current, seconds: current.seconds + 1 })), 1000)
    return () => clearInterval(id)
  }, [state.running])
  const minutes = String(Math.floor(state.seconds / 60)).padStart(2, '0'), seconds = String(state.seconds % 60).padStart(2, '0')
  return {
    running: state.running,
    visible: state.visible,
    label: `${minutes}:${seconds}`,
    toggleRunning: () => setState((current) => ({ ...current, running: !current.running })),
    toggleVisible: () => setState((current) => ({ ...current, visible: !current.visible })),
  }
}
