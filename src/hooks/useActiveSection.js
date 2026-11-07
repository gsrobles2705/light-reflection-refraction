import { useEffect, useState } from 'react'

/** Observation band starting below the fixed header (56 px + margin); the last section crossing it wins. */
const OBSERVER_MARGIN = '-72px 0px -62% 0px'
const TOP_OFFSET = 80

/** Returns the id of the section currently being read (the first id when scrolled to the very top). */
export function useActiveSection(sectionIds) {
  const [active, setActive] = useState(sectionIds[0])
  useEffect(() => {
    const visible = new Set()
    const pick = () => setActive(scrollY < TOP_OFFSET ? sectionIds[0] : [...sectionIds].reverse().find((id) => visible.has(id)) || sectionIds[0])
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)))
      pick()
    }, { rootMargin: OBSERVER_MARGIN })
    sectionIds.forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element) })
    let frame = 0
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; pick() }) }
    addEventListener('scroll', onScroll, { passive: true })
    return () => { observer.disconnect(); removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [sectionIds])
  return active
}
