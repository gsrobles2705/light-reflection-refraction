import { useEffect, useState } from 'react'

/**
 * True while the reader is scrolling down (floating bars hide so they never cover content) and false again as soon as
 * they scroll up, are near the top, or reach the end of the page. Small movements are ignored.
 */
export function useScrolledDown({ threshold = 10, minY = 160, endZone = 120 } = {}) {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    let last = scrollY, frame = 0
    const update = () => {
      frame = 0
      const y = scrollY, delta = y - last
      const atEnd = innerHeight + y >= document.documentElement.scrollHeight - endZone
      if (y < minY || atEnd) setHidden(false)
      else if (delta > threshold) setHidden(true)
      else if (delta < -threshold) setHidden(false)
      if (Math.abs(delta) > threshold || y < minY) last = y
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    addEventListener('scroll', onScroll, { passive: true })
    return () => { removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [threshold, minY, endZone])
  return hidden
}
