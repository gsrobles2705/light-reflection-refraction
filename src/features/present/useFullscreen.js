import { useEffect, useRef, useState } from 'react'

/**
 * Fullscreen state and controls. Fullscreen can be requested by the user directly or as part of the presentation mode;
 * in the second case leaving fullscreen (for example with the browser's Esc) also ends the presentation, which is
 * reported through `onExitedPresentationFullscreen`.
 */
export function useFullscreen({ onExitedPresentationFullscreen }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const ownedByPresentation = useRef(false)
  const exitHandler = useRef(onExitedPresentationFullscreen)
  exitHandler.current = onExitedPresentationFullscreen
  const supported = Boolean(document.documentElement.requestFullscreen)   // not available on iPhone

  useEffect(() => {
    const onChange = () => {
      const active = Boolean(document.fullscreenElement)
      setIsFullscreen(active)
      if (!active && ownedByPresentation.current) { ownedByPresentation.current = false; exitHandler.current() }
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  return {
    supported,
    isFullscreen,
    toggle() {
      ownedByPresentation.current = false
      if (document.fullscreenElement) document.exitFullscreen()
      else document.documentElement.requestFullscreen?.()
    },
    /** Enters fullscreen for the presentation (no-op if already fullscreen or unsupported). */
    enterForPresentation() {
      if (document.fullscreenElement || !supported) return
      document.documentElement.requestFullscreen().then(() => { ownedByPresentation.current = true }).catch(() => {})
    },
    /** Leaves fullscreen only if the presentation was the one that entered it. */
    exitIfOwnedByPresentation() {
      if (ownedByPresentation.current && document.fullscreenElement) { ownedByPresentation.current = false; document.exitFullscreen?.() }
    },
  }
}
