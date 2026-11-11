import { lazy, Suspense, useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import QrCode from '../../components/QrCode.jsx'
import { COURSE_LINE, SITE_URL } from '../../config/site.js'
import Hero2DFallback from './Hero2DFallback.jsx'

// Three.js is loaded on demand: it is by far the heaviest dependency and only the hero needs it
const Hero3D = lazy(() => import('./Hero3D.jsx'))

const TITLE_LINES = ['Luz en', 'Movimiento']
const EASE = [0.23, 1, 0.32, 1]
const supportsWebGL = () => {
  try { const canvas = document.createElement('canvas'); return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl')) } catch { return false }
}
/** True after the first paint + an idle moment, so the title appears instantly and WebGL boots afterwards. */
function useAfterFirstPaint() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const start = () => setReady(true)
    if (typeof requestIdleCallback === 'function') { const id = requestIdleCallback(start, { timeout: 700 }); return () => cancelIdleCallback(id) }
    const id = setTimeout(start, 250); return () => clearTimeout(id)
  }, [])
  return ready
}
const touchOnly = () => matchMedia('(pointer: coarse)').matches

/** Fade-in whose delay (seconds) staggers the hero's elements. */
const fadeIn = (delay) => ({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay } })

/** Landing section: title, course info, call-to-action buttons, QR "join" card and the animated prism. */
export default function Hero({ theme }) {
  const reduceMotion = useReducedMotion(), [webgl, setWebgl] = useState(supportsWebGL), ready = useAfterFirstPaint()
  const { scrollY } = useScroll()
  const textOffset = useTransform(scrollY, [0, 500], [0, reduceMotion ? 0 : 60])
  const textOpacity = useTransform(scrollY, [0, 500], [1, reduceMotion ? 1 : 0.2])

  return (
    <section id="inicio" className="hero">
      {webgl
        ? (ready && <Suspense fallback={null}><Hero3D theme={theme} reduceMotion={reduceMotion} onFail={() => setWebgl(false)} /></Suspense>)
        : <Hero2DFallback theme={theme} reduceMotion={reduceMotion} />}
      <motion.div className="wrap" style={{ y: textOffset, opacity: textOpacity }}>
        <div className="hero-txt">
          <motion.span className="tag" {...fadeIn(0)}>{COURSE_LINE.split(' · ').map((part, i) => <span key={part} className="nw">{i > 0 && '· '}{part} </span>)}</motion.span>
          <h1 aria-label="Luz en Movimiento">
            {TITLE_LINES.map((line, i) => (
              <motion.span key={line} aria-hidden="true" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.14, duration: 0.7, ease: EASE }}>{line}</motion.span>
            ))}
          </h1>
          <motion.p {...fadeIn(0.6)}>
            Un recorrido interactivo por la <b>reflexión</b> y la <b>refracción</b>: cómo la luz rebota, se dobla y se descompone en colores al cambiar de medio.
          </motion.p>
          <motion.p className="hero-goal" {...fadeIn(0.75)}>Al terminar podrás predecir cómo se dobla un rayo al pasar entre dos medios y comprobarlo con la ley de Snell.</motion.p>
          <motion.div className="hero-act" {...fadeIn(0.9)}>
            <a href="#simulador" className="btn">Probar el laboratorio</a>
            <a href="#experimento" className="btn ghost">Ver el experimento</a>
          </motion.div>
          <motion.p className="hint" {...fadeIn(1.2)}><i aria-hidden="true" />{touchOnly() ? 'Desliza el dedo: el prisma gira y el espectro se abre.' : 'Mueve el puntero o toca la pantalla: el prisma gira y el espectro se abre.'}</motion.p>
          <motion.p className="hero-scale" {...fadeIn(1.3)}>Espectro ampliado para distinguir los colores; no está a escala.</motion.p>
        </div>
      </motion.div>
      <motion.div className="hero-share" style={{ y: textOffset, opacity: textOpacity }}>
        <QrCode url={SITE_URL} className="hero-qr" />
        <p><b>Compártelo con la clase</b><span>Escanea el código o escribe {SITE_URL.replace(/^https?:\/\//, '')}</span></p>
      </motion.div>
    </section>
  )
}
