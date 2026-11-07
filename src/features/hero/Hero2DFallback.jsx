import { useEffect, useRef } from 'react'
import { setupCanvas } from '../../lib/canvas.js'
import { advancePointer, drawHeroFallback } from '../../rendering/heroFallbackRenderer.js'

/** Flat 2D prism used when WebGL is unavailable. With reduced motion it draws a single frame. */
export default function Hero2DFallback({ theme, reduceMotion }) {
  const canvasRef = useRef()
  useEffect(() => {
    const canvas = canvasRef.current, dark = theme === 'dark', pointer = { x: 0.62, y: 0.5, targetX: 0.62, targetY: 0.5 }
    let ctx, size, frame = 0, time = reduceMotion ? 0.6 : 0
    const draw = () => { advancePointer(pointer); drawHeroFallback(ctx, size, pointer, time, dark) }
    const resize = () => {
      size = { width: canvas.offsetWidth, height: canvas.offsetHeight }
      ctx = setupCanvas(canvas, size.width, size.height)
      if (reduceMotion) draw()
    }
    const onPointerMove = (event) => { pointer.targetX = event.clientX / innerWidth; pointer.targetY = event.clientY / innerHeight }
    let visible = true
    const loop = () => { time += 0.012; draw(); frame = visible ? requestAnimationFrame(loop) : 0 }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible && !frame && !reduceMotion) loop() })
    observer.observe(canvas)
    resize()
    addEventListener('resize', resize)
    if (!reduceMotion) { addEventListener('pointermove', onPointerMove); loop() }
    return () => { observer.disconnect(); visible = false; cancelAnimationFrame(frame); removeEventListener('resize', resize); removeEventListener('pointermove', onPointerMove) }
  }, [theme, reduceMotion])
  return <canvas ref={canvasRef} className="hero-cv" aria-hidden="true" />
}
