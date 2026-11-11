import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import BrandMark from '../../components/BrandMark.jsx'
import Icon from '../../components/Icon.jsx'
import { ROUTE_STAGES } from '../../content/navigation.js'
import { useActiveSection } from '../../hooks/useActiveSection.js'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'
import { useScrolledPast } from '../../hooks/useScrolledPast.js'
import ScrollProgress from './ScrollProgress.jsx'
import ThemeToggle from './ThemeToggle.jsx'

/**
 * Fixed top bar, as wide as the content. Desktop: brand, the five route stages as plain text (the current one gets a
 * 2 px accent underline), theme toggle and a "Secciones" button that opens every section grouped by stage. Phones and
 * tablets: brand, theme toggle and menu (the stages live in the bottom route bar). The border and the blur appear only
 * once the page has scrolled; the reading progress is a 2 px line on the bottom edge.
 */
export default function Header({ items, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sectionIds = useMemo(() => items.map((item) => item.id), [items])
  const activeId = useActiveSection(sectionIds)
  const scrolled = useScrolledPast()
  useEscapeKey(() => setMenuOpen(false), menuOpen)

  // Pressing anywhere outside the open menu (and its button) closes it; the button itself still toggles it
  useEffect(() => {
    if (!menuOpen) return
    const closeOnOutsidePress = (event) => { if (!event.target.closest?.('#menu, .sbtn')) setMenuOpen(false) }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [menuOpen])

  const labelOf = useMemo(() => Object.fromEntries(items.map((item) => [item.id, item.label])), [items])
  const stages = useMemo(
    () => ROUTE_STAGES.map((stage) => ({ ...stage, sections: stage.sections.filter((id) => labelOf[id]) })).filter((stage) => stage.sections.length),
    [labelOf],
  )
  const staged = useMemo(() => new Set(stages.flatMap((stage) => stage.sections)), [stages])
  const stageIndex = stages.findIndex((stage) => stage.sections.includes(activeId))
  const loose = items.filter((item) => !staged.has(item.id))
  const closeMenu = () => setMenuOpen(false)
  const looseLink = (item) => (
    <a key={item.id} className="mhome" href={'#' + item.id} aria-current={activeId === item.id ? 'location' : undefined} onClick={closeMenu}>{item.label}</a>
  )

  return (
    <header>
      <nav aria-label="Principal" className={scrolled ? 'is-scrolled' : ''}>
        <div className="wrap navin">
          <a className="brand" href="#inicio"><BrandMark />Luz en Movimiento</a>
          <ol className="stages">
            {stages.map((stage, i) => {
              const on = i === stageIndex
              return (
                <li key={stage.id}>
                  <a href={'#' + stage.sections[0]} className={on ? 'on' : ''} aria-current={on ? 'step' : undefined}>
                    {stage.label}{on && <motion.i layoutId="uline" className="uline" aria-hidden="true" />}
                  </a>
                </li>
              )
            })}
          </ol>
          <div className="navtools">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button className="sbtn" aria-expanded={menuOpen} aria-controls="menu" onClick={() => setMenuOpen((open) => !open)}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={20} /><span className="sbtn-l">Secciones</span>
            </button>
          </div>
          <div id="menu" className={'links' + (menuOpen ? ' open' : '')}>
            {loose.filter((item) => item.id === 'inicio').map(looseLink)}
            {stages.map((stage, i) => (
              <div className="mgroup" key={stage.id}>
                <a className="mstage" href={'#' + stage.sections[0]} onClick={closeMenu}><i aria-hidden="true">{i + 1}</i>{stage.label}</a>
                <ul>
                  {stage.sections.map((id) => (
                    <li key={id}><a href={'#' + id} aria-current={activeId === id ? 'location' : undefined} onClick={closeMenu}>{labelOf[id]}</a></li>
                  ))}
                </ul>
              </div>
            ))}
            {loose.filter((item) => item.id !== 'inicio').map(looseLink)}
          </div>
        </div>
        <ScrollProgress />
      </nav>
    </header>
  )
}
