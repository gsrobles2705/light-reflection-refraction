import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { transitionTheme } from '../lib/themeTransition.js'

const THEME_COLOR = { dark: '#12161c', light: '#f4f6f8' }
const DARK_QUERY = '(prefers-color-scheme: dark)'
const systemTheme = () => (matchMedia(DARK_QUERY).matches ? 'dark' : 'light')

/**
 * Light/dark theme stored in `<html data-theme>`. It always follows the operating system: it starts from the system
 * preference and changes live when the system switches. The toggle button overrides it only until the system changes
 * again (nothing is persisted, so the next visit matches the system again).
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const initial = systemTheme()
    document.documentElement.dataset.theme = initial
    return initial
  })

  useEffect(() => {
    const query = matchMedia(DARK_QUERY)
    const follow = () => setTheme(query.matches ? 'dark' : 'light')
    query.addEventListener('change', follow)
    return () => query.removeEventListener('change', follow)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  }, [theme])

  const toggleTheme = (event) => {
    const next = theme === 'dark' ? 'light' : 'dark'
    // flushSync keeps React and the view-transition snapshot in the same frame
    transitionTheme(event.currentTarget, () => { document.documentElement.dataset.theme = next; flushSync(() => setTheme(next)) })
  }
  return { theme, toggleTheme }
}
