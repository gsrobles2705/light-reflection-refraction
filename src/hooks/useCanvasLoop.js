import { useEffect, useRef } from 'react'
import { displayScale, isTouchDevice, prefersReducedMotion, setupCanvas } from '../lib/canvas.js'

const TOUCH_FRAME_MS = 1000 / 30   // phones animate at 30 fps: half the work, indistinguishable for slow ripples
const REDUCED_FRAME_MS = 1000 / 10

/**
 * Runs a requestAnimationFrame loop for a canvas, but only while the canvas is on screen (an off-screen canvas costs
 * nothing). Touch devices are capped at 30 fps.
 *
 * `onFrame({ ctx, deltaSeconds, elapsedSeconds, scale })` is called every frame; `elapsedSeconds` is frozen at 0 when
 * the user prefers reduced motion. The latest `onFrame` is always used, so callers may pass an inline function.
 */
export function useCanvasLoop(canvasRef, { width, height, onFrame }) {
  const frameHandler = useRef(onFrame)
  frameHandler.current = onFrame
  useEffect(() => {
    const canvas = canvasRef.current, ctx = setupCanvas(canvas, width, height), reduced = prefersReducedMotion()
    const minFrame = reduced ? REDUCED_FRAME_MS : isTouchDevice() ? TOUCH_FRAME_MS : 0
    const start = performance.now()
    let last = start, lastDraw = 0, handle = 0, visible = true
    const loop = (now) => {
      handle = visible ? requestAnimationFrame(loop) : 0
      if (now - lastDraw < minFrame - 2) return
      lastDraw = now
      const deltaSeconds = (now - last) / 1000
      last = now
      frameHandler.current({ ctx, deltaSeconds, elapsedSeconds: reduced ? 0 : (now - start) / 1000, scale: displayScale(canvas, width) })
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible && !handle) { last = performance.now(); handle = requestAnimationFrame(loop) }
    }, { rootMargin: '120px' })
    observer.observe(canvas)
    handle = requestAnimationFrame(loop)
    return () => { visible = false; cancelAnimationFrame(handle); observer.disconnect() }
  }, [canvasRef, width, height])
}
