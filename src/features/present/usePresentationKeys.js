import { useEffect, useRef } from 'react'

const IGNORED_TARGETS = /INPUT|SELECT|TEXTAREA/
/** Controls that use the arrow keys themselves; slide navigation must not hijack them. */
const OWN_ARROW_KEYS = '[role=tab],[role=slider],[role=combobox],[role=listbox],canvas'
/** Elements that already react to Space / Enter. */
const OWN_ACTION_KEYS = 'button,a,summary,[role=tab],[role=switch],[role=slider]'

/**
 * Keyboard shortcuts: P presentation, F fullscreen, T timer, Esc closes the menu / leaves the presentation;
 * while presenting: ←/PageUp and →/PageDown change slide, Home/End jump to the extremes, Space/Enter show the next
 * step of the slide and Backspace/Shift+Space the previous one.
 *
 * `actions` = { togglePresentation, toggleFullscreen, toggleTimer, closeMenu, leavePresentation, previous, next, first, last, step }
 */
export function usePresentationKeys({ presenting, menuOpen, actions }) {
  const latest = useRef({ presenting, menuOpen, actions })
  latest.current = { presenting, menuOpen, actions }
  useEffect(() => {
    const onKeyDown = (event) => {
      if (IGNORED_TARGETS.test(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return
      const { presenting: active, menuOpen: open, actions: run } = latest.current
      const key = event.key.toLowerCase(), ownsArrows = Boolean(event.target.closest?.(OWN_ARROW_KEYS))
      const navigate = (action) => { event.preventDefault(); action() }
      if (key === 'p') run.togglePresentation()
      else if (key === 'f') run.toggleFullscreen()
      else if (key === 't') run.toggleTimer()
      else if (key === 'escape' && open) run.closeMenu()
      else if (key === 'escape' && active) run.leavePresentation()
      else if (active && !ownsArrows && (event.key === 'ArrowRight' || event.key === 'PageDown')) navigate(run.next)
      else if (active && !ownsArrows && (event.key === 'ArrowLeft' || event.key === 'PageUp')) navigate(run.previous)
      else if (active && !event.target.closest?.(OWN_ACTION_KEYS) && (event.key === ' ' || key === 'enter')) navigate(() => { if (!event.repeat) run.step(event.shiftKey ? -1 : 1) })   // holding the key must not skip several parts
      else if (active && !event.target.closest?.(OWN_ACTION_KEYS) && key === 'backspace') navigate(() => run.step(-1))
      else if (active && event.key === 'Home') navigate(run.first)
      else if (active && event.key === 'End') navigate(run.last)
    }
    addEventListener('keydown', onKeyDown)
    return () => removeEventListener('keydown', onKeyDown)
  }, [])
}
