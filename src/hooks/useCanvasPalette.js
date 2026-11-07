import { useEffect, useRef } from 'react'
import { readCanvasPalette } from '../rendering/palette.js'

/** Keeps a ref with the current theme colors for canvas drawing; refreshed whenever `theme` changes. */
export function useCanvasPalette(theme) {
  const palette = useRef({})
  useEffect(() => { palette.current = readCanvasPalette() }, [theme])
  return palette
}
