import { useEffect, useId, useRef, useState } from 'react'

const LIST_MAX_HEIGHT = 280

/**
 * Custom drop-down (a styled replacement for the native <select>, whose option list cannot be themed).
 * `options` = [{ value, label, detail? }]; `value` is the selected option's value; `onChange(value)` reports the choice.
 * Keyboard: Enter / Space / ArrowDown open it, arrows move, Home / End jump, Enter / Space choose, Esc closes.
 * Pressing outside closes it. The list opens upward when there is no room below. Pair it with `<label htmlFor={id}>`.
 */
export default function Select({ id, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [upward, setUpward] = useState(false)
  const root = useRef(null), button = useRef(null)
  const listId = useId()
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))
  const selected = options[selectedIndex]

  const openList = () => {
    const rect = button.current.getBoundingClientRect()
    setUpward(innerHeight - rect.bottom < Math.min(LIST_MAX_HEIGHT, options.length * 46 + 12) && rect.top > innerHeight - rect.bottom)
    setActive(selectedIndex); setOpen(true)
  }
  const close = (refocus = true) => { setOpen(false); if (refocus) button.current?.focus() }
  const choose = (index) => { onChange(options[index].value); close() }

  useEffect(() => {
    if (!open) return
    const closeOnOutsidePress = (event) => { if (!root.current?.contains(event.target)) setOpen(false) }
    document.addEventListener('pointerdown', closeOnOutsidePress)
    return () => document.removeEventListener('pointerdown', closeOnOutsidePress)
  }, [open])

  useEffect(() => { if (open) root.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' }) }, [open, active])

  const onKeyDown = (event) => {
    const last = options.length - 1
    const move = (index) => { event.preventDefault(); setActive(Math.min(last, Math.max(0, index))) }
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) { event.preventDefault(); event.stopPropagation(); openList() }
      return
    }
    event.stopPropagation()   // the page's own shortcuts (presentation mode) must not react while the list is open
    if (event.key === 'ArrowDown') move(active + 1)
    else if (event.key === 'ArrowUp') move(active - 1)
    else if (event.key === 'Home') move(0)
    else if (event.key === 'End') move(last)
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(active) }
    else if (event.key === 'Escape') { event.preventDefault(); close() }
    else if (event.key === 'Tab') close(false)
  }

  return (
    <div className={'sel' + (open ? ' open' : '') + (upward ? ' up' : '')} ref={root}>
      <button type="button" id={id} className="sel-btn" ref={button} role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        onClick={() => (open ? close(false) : openList())} onKeyDown={onKeyDown}>
        <span className="sel-name">{selected?.label}</span>
        {selected?.detail && <span className="sel-detail">{selected.detail}</span>}
        <svg className="sel-chev" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <ul className="sel-list" id={listId} role="listbox" aria-labelledby={id}>
          {options.map((option, index) => (
            <li key={option.value} role="option" aria-selected={index === selectedIndex} data-active={index === active} className={index === selectedIndex ? 'on' : ''}
              onPointerEnter={() => setActive(index)} onClick={() => choose(index)}>
              <span className="sel-name">{option.label}</span>
              {option.detail && <span className="sel-detail">{option.detail}</span>}
              <svg className="sel-tick" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
