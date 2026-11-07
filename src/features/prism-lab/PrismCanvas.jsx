import { useRef } from 'react'
import { PRISM_LAB } from '../../domain/prism.js'
import { useTouchGuard } from '../../hooks/useTouchGuard.js'
import { clientToCanvas } from '../../lib/canvas.js'
import { findHandleAt, settingsPatchForDrag } from './interaction.js'
import { usePrismAnimation } from './usePrismAnimation.js'

const { width: W, height: H } = PRISM_LAB

/**
 * Canvas of the prism lab. Drag the prism to rotate it, the laser body to move it up/down and the white ring to aim.
 * `onChange(patch)` receives settings changes; `onDragStart()` fires when a handle is grabbed.
 */
export default function PrismCanvas({ settings, selectedWavelength, materialName, onChange, onDragStart }) {
  const canvasRef = useRef(), drag = useRef(null), isDraggingRef = useRef(false)
  const latestSettings = useRef(settings)
  latestSettings.current = settings

  usePrismAnimation(canvasRef, { settings, selectedWavelength, isDraggingRef })
  const pointOf = (clientX, clientY) => clientToCanvas(canvasRef.current, clientX, clientY, W, H)
  useTouchGuard(canvasRef, (clientX, clientY) => Boolean(findHandleAt(pointOf(clientX, clientY), latestSettings.current)))

  const endDrag = () => { drag.current = null; isDraggingRef.current = false }
  const onPointerDown = (event) => {
    drag.current = findHandleAt(pointOf(event.clientX, event.clientY), latestSettings.current)
    isDraggingRef.current = Boolean(drag.current)
    if (drag.current) { canvasRef.current.setPointerCapture(event.pointerId); onDragStart() }
  }
  const onPointerMove = (event) => {
    if (drag.current) onChange(settingsPatchForDrag(drag.current, pointOf(event.clientX, event.clientY), latestSettings.current))
  }

  return (
    <canvas ref={canvasRef} className="pcv" aria-label={`Prisma de ${materialName}. Arrastra el prisma para girarlo, el láser para moverlo y el aro blanco para apuntarlo.`}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag} />
  )
}
