import { useEffect, useState } from 'react'

/** True once the page has scrolled more than `offset` px (used to show the header border and blur only then). */
export function useScrolledPast(offset = 8) {
  const [past, setPast] = useState(() => typeof window !== 'undefined' && window.scrollY > offset)
  useEffect(() => {
    let frame = 0
    const update = () => { frame = 0; setPast(window.scrollY > offset) }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    addEventListener('scroll', onScroll, { passive: true })
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [offset])
  return past
}
