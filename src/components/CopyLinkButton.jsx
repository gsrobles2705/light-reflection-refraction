import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'

const LABEL = { idle: 'Copiar enlace', copied: '¡Enlace copiado!', failed: 'No se pudo copiar' }

/** Copies `url` to the clipboard (with a textarea fallback for old browsers) and confirms it with text, not just color. */
export default function CopyLinkButton({ url, className = 'copybtn' }) {
  const [state, setState] = useState('idle')
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    let ok = false
    try { await navigator.clipboard.writeText(url); ok = true } catch {
      try {
        const field = document.createElement('textarea')
        field.value = url; field.setAttribute('readonly', ''); field.style.cssText = 'position:fixed;opacity:0'
        document.body.appendChild(field); field.select(); ok = document.execCommand('copy'); field.remove()
      } catch { ok = false }
    }
    setState(ok ? 'copied' : 'failed')
    clearTimeout(timer.current); timer.current = setTimeout(() => setState('idle'), 2400)
  }

  return (
    <>
      <button type="button" className={className} onClick={copy}>{state === 'copied' && <Icon name="check" size={18} />}{LABEL[state]}</button>
      <span className="sr" role="status">{state === 'idle' ? '' : LABEL[state]}</span>
    </>
  )
}
