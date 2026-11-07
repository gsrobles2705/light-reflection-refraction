import { prefersReducedMotion } from './canvas.js'

const TRANSITION = { duration: 750, easing: 'cubic-bezier(.77,0,.175,1)' }

/**
 * Runs `applyTheme` inside a view transition: a circular "lens iris" with a spectral rim opens from the
 * clicked element. Falls back to applying the theme immediately when the browser or the user doesn't allow it.
 */
export function transitionTheme(originElement, applyTheme) {
  if (!document.startViewTransition || prefersReducedMotion()) return applyTheme()
  const root = document.documentElement, box = originElement.getBoundingClientRect()
  const x = box.left + box.width / 2, y = box.top + box.height / 2
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  root.classList.add('vt')
  const transition = document.startViewTransition(applyTheme)
  transition.ready.catch(() => {})
  transition.ready.then(() => {
    root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, { ...TRANSITION, pseudoElement: '::view-transition-new(root)' })
    const ring = document.createElement('div')
    ring.className = 'iris'
    Object.assign(ring.style, { left: x - radius + 'px', top: y - radius + 'px', width: 2 * radius + 'px', height: 2 * radius + 'px' })
    document.body.append(ring)
    ring.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], TRANSITION).finished.finally(() => ring.remove())
  })
  transition.finished.finally(() => root.classList.remove('vt'))
}
