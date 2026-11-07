import { useEffect, useRef } from 'react'
import { buildPrismGeometry, PRISM_LAB } from '../../domain/prism.js'
import { displayScale, isTouchDevice, prefersReducedMotion, setupCanvas } from '../../lib/canvas.js'
import { createPrismLabRenderer } from '../../rendering/prismLabRenderer.js'

const { width: W, height: H, centerX, centerXWithPair } = PRISM_LAB
const SETTLE_RATE = 6            // exponential smoothing speed (1/s)
const MAX_FRAME_SECONDS = 0.05   // clamp long frames (tab switches) so the motion never jumps
const TOUCH_FRAME_MS = 1000 / 30   // idle wavefront animation on phones runs at 30 fps
const OPACITY_EPSILON = 0.004, VALUE_EPSILON = 0.03
const ANIMATED_KEYS = ['rotation', 'apexAngle', 'laserY', 'laserAngle', 'wavelength', 'pairGap', 'centerX', 'prismOpacity', 'pairOpacity', 'whiteMix']

/** Values the animation eases toward for a given target settings object. */
const goalOf = (settings) => ({
  rotation: settings.rotation, apexAngle: settings.apexAngle, laserY: settings.laserY, laserAngle: settings.laserAngle, wavelength: settings.wavelength, pairGap: settings.pairGap,
  centerX: settings.newtonPair ? centerXWithPair : centerX,
  prismOpacity: settings.prismHidden ? 0 : 1, pairOpacity: settings.newtonPair ? 1 : 0, whiteMix: settings.whiteLight ? 1 : 0,
})

/**
 * Draws the prism lab and eases every change toward its target, so guided steps never jump: the prism fades in, the
 * second prism slides in and white light cross-fades with single-color light. While the canvas is on screen the beam
 * keeps animating (wavefronts); otherwise frames are only requested while something is still moving.
 *
 * @param {{ settings:object, selectedWavelength:number, isDraggingRef:{current:boolean} }} source
 *        `settings` is the *target* state; dragging snaps (no easing) so direct manipulation feels immediate.
 */
export function usePrismAnimation(canvasRef, { settings, selectedWavelength, isDraggingRef }) {
  const latest = useRef({ settings, selectedWavelength })
  latest.current = { settings, selectedWavelength }
  const requestFrame = useRef(() => {})

  useEffect(() => {
    const canvas = canvasRef.current, ctx = setupCanvas(canvas, W, H), reduced = prefersReducedMotion()
    const touch = isTouchDevice(), render = createPrismLabRenderer()
        let handle = 0, lastTime = 0, eased = null, onScreen = false
    const observer = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; if (onScreen) requestFrame.current() })
    observer.observe(canvas)

    const tick = (now) => {
      handle = 0
      if (touch && lastTime && now - lastTime < TOUCH_FRAME_MS - 2 && !isDraggingRef.current) { handle = requestAnimationFrame(tick); return }
      const { settings: target, selectedWavelength: selected } = latest.current, goal = goalOf(target)
      if (!eased) eased = { ...goal }
      const deltaSeconds = Math.min(MAX_FRAME_SECONDS, lastTime ? (now - lastTime) / 1000 : 0.016)
      lastTime = now
      const snap = reduced || isDraggingRef.current, smoothing = 1 - Math.exp(-deltaSeconds * SETTLE_RATE)
      let moving = false
      for (const key of ANIMATED_KEYS) {
        const remaining = goal[key] - eased[key], epsilon = /Opacity|whiteMix/.test(key) ? OPACITY_EPSILON : VALUE_EPSILON
        if (snap || Math.abs(remaining) < epsilon) eased[key] = goal[key]
        else { eased[key] += remaining * smoothing; moving = true }
      }
      const display = { ...target, rotation: eased.rotation, apexAngle: eased.apexAngle, laserY: eased.laserY, laserAngle: eased.laserAngle, wavelength: eased.wavelength, pairGap: eased.pairGap,
        prismHidden: eased.prismOpacity < 0.5, newtonPair: eased.pairOpacity > 0.5 }
      const geometry = buildPrismGeometry({ ...display, newtonPair: eased.pairOpacity > 0.01, centerX: eased.centerX })
      render(ctx, display, geometry, selected, { prismOpacity: eased.prismOpacity, pairOpacity: eased.pairOpacity, whiteMix: eased.whiteMix }, { time: reduced ? 0 : now / 1000, scale: displayScale(canvas, W) })
      if (moving || (onScreen && !reduced)) handle = requestAnimationFrame(tick)
      else lastTime = 0
    }
    requestFrame.current = () => { if (!handle) handle = requestAnimationFrame(tick) }
    requestFrame.current()
    return () => { cancelAnimationFrame(handle); observer.disconnect() }
  }, [canvasRef, isDraggingRef])

  useEffect(() => { requestFrame.current() }, [settings, selectedWavelength])
}
