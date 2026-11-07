import { useRef } from 'react'
import Icon from '../../components/Icon.jsx'
import { toDegrees } from '../../domain/units.js'
import { clamp } from '../../domain/numbers.js'
import { useCanvasLoop } from '../../hooks/useCanvasLoop.js'
import { useTouchGuard } from '../../hooks/useTouchGuard.js'
import { clientToCanvas } from '../../lib/canvas.js'
import { createSimulatorRenderer } from '../../rendering/simulatorRenderer.js'
import { wavelengthToCss } from '../../domain/spectrum.js'
import { CANVAS } from '../../rendering/simulatorModel.js'

const { width: W, height: H, centerX: CX } = CANVAS
/** A touch only grabs the laser when it lands this close (logical px); elsewhere the page scrolls. */
const TOUCH_GRAB_RADIUS = 110
const MAX_ANGLE = 89
const KEYBOARD_STEP = 1, KEYBOARD_BIG_STEP = 5

/**
 * Interactive canvas: drag anywhere above the surface to aim the laser, or use the arrow keys
 * (Shift = bigger steps). Reports angle changes through `onAngleChange(degrees)`.
 */
export default function SimulatorCanvas({ scene, model, paletteRef, hintVisible, onAngleChange, onUserInteract }) {
  const canvasRef = useRef(), dragging = useRef(false), render = useRef(null)
  render.current ||= createSimulatorRenderer()

  useCanvasLoop(canvasRef, {
    width: W, height: H,
    onFrame: ({ ctx, elapsedSeconds, scale }) => render.current(ctx, scene, model, { time: elapsedSeconds, palette: paletteRef.current, rayColor: wavelengthToCss(scene.wavelength), scale }),
  })

  const aimAt = (event) => {
    const [x, y] = clientToCanvas(canvasRef.current, event.clientX, event.clientY, W, H)
    if (y >= model.surfaceY - 4) return   // only the air side aims the laser
    onAngleChange(Math.round(clamp(toDegrees(Math.atan2(CX - x, model.surfaceY - y)), 0, MAX_ANGLE) * 2) / 2)
  }
  const isNearLaser = (clientX, clientY) => {
    const [x, y] = clientToCanvas(canvasRef.current, clientX, clientY, W, H), laser = model.segments[0]
    return Math.hypot(x - laser.x1, y - laser.y1) < TOUCH_GRAB_RADIUS
  }
  useTouchGuard(canvasRef, isNearLaser)

  const onPointerDown = (event) => {
    if (event.pointerType === 'touch' && !isNearLaser(event.clientX, event.clientY)) return
    dragging.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    aimAt(event)
  }
  const stopDragging = () => { dragging.current = false }
  const onKeyDown = (event) => {
    const step = event.shiftKey ? KEYBOARD_BIG_STEP : KEYBOARD_STEP
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { onUserInteract({ incidentAngle: Math.max(0, scene.incidentAngle - step) }); event.preventDefault() }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { onUserInteract({ incidentAngle: Math.min(MAX_ANGLE, scene.incidentAngle + step) }); event.preventDefault() }
  }

  return (
    <div className="cvwrap">
      <canvas ref={canvasRef} className="simcv" tabIndex={0} role="img" aria-label={`Simulador de reflexión y refracción. Ángulo de incidencia ${scene.incidentAngle} grados. Usa las flechas del teclado para cambiarlo.`}
        onPointerDown={onPointerDown} onPointerMove={(event) => dragging.current && aimAt(event)} onPointerUp={stopDragging} onPointerCancel={stopDragging} onKeyDown={onKeyDown} />
      {hintVisible && <div className="cvhint" aria-hidden="true"><Icon name="cursor" size={16} />Arrastra el láser para moverlo</div>}
    </div>
  )
}
