import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import BrandMark from '../../components/BrandMark.jsx'
import Icon from '../../components/Icon.jsx'
import { useActiveSection } from '../../hooks/useActiveSection.js'
import { useEscapeKey } from '../../hooks/useEscapeKey.js'

/** Fixed top navigation: brand, section links (collapsible on small screens) and active-section highlight. */
export default function Header({ items }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const sectionIds = useMemo(() => items.map((item) => item.id), [items])
  const activeId = useActiveSection(sectionIds)
  useEscapeKey(() => setMenuOpen(false), menuOpen)

  return (
    <header>
      <nav aria-label="Principal"><div className="wrap navin">
        <a className="brand" href="#inicio"><BrandMark />Luz en Movimiento</a>
        <button className="burger" aria-expanded={menuOpen} aria-controls="menu" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen((open) => !open)}>
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
        <div id="menu" className={'links ' + (menuOpen ? 'open' : '')}>
          {items.map(({ id, label }) => (
            <a key={id} href={'#' + id} style={{ '--c': `var(--h-${id})` }} aria-label={label} title={label} aria-current={activeId === id ? 'location' : undefined}
              className={activeId === id ? 'on' : ''} onClick={() => setMenuOpen(false)}>
              <span className="lbl">{label}</span>{activeId === id && <motion.i layoutId="pill" className="pill" />}
            </a>
          ))}
        </div>
      </div></nav>
    </header>
  )
}
