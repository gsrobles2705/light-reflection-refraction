import { motion, useScroll, useSpring } from 'motion/react'

/** Thin spectral bar at the top showing how far down the page the reader is. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const smoothed = useSpring(scrollYProgress, { stiffness: 120, damping: 28 })
  return <motion.div className="pbar" style={{ scaleX: smoothed }} aria-hidden="true" />
}
