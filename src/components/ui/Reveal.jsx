import { useEffect, useRef } from 'react'

// One IntersectionObserver serves every Reveal on the page (a motion component per block was a measurable cost).
let sharedObserver
const observer = () => sharedObserver ||= new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return
    entry.target.classList.add('in')
    sharedObserver.unobserve(entry.target)
  })
}, { rootMargin: '0px 0px -60px 0px' })

/** Fades and slides its children in the first time they scroll into view (see .rv in perf.css). */
export default function Reveal({ children, delay = 0, className = '', y = 16 }) {
  const element = useRef()
  useEffect(() => {
    const node = element.current
    if (typeof IntersectionObserver === 'undefined') { node.classList.add('in'); return }
    observer().observe(node)
    return () => sharedObserver?.unobserve(node)
  }, [])
  return <div ref={element} className={('rv ' + className).trim()} style={{ '--rv-y': `${y}px`, '--rv-d': `${delay}s` }}>{children}</div>
}
