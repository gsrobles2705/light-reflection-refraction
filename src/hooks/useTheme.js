import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { transitionTheme } from '../lib/themeTransition.js'

const systemTheme = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

/** Light/dark theme stored in `<html data-theme>`; starts from the OS preference. */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const initial = systemTheme()
    document.documentElement.dataset.theme = initial
    return initial
  })
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])

  const toggleTheme = (event) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    // flushSync keeps React and the view-transition snapshot in the same frame
    transitionTheme(event.currentTarget, () => { document.documentElement.dataset.theme = next; flushSync(() => setTheme(next)) })
  }
  return { theme, toggleTheme }
}
