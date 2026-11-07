import Icon from '../../components/Icon.jsx'

/** Floating button that switches between the light and dark theme. */
export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button id="th" aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} onClick={onToggle}>
      <Icon name={isDark ? 'sun' : 'moon'} size={22} />
    </button>
  )
}
