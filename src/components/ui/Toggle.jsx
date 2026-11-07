/** Accessible on/off switch. */
export default function Toggle({ on, onChange, children }) {
  return (
    <button type="button" role="switch" aria-checked={on} className={'tg ' + (on ? 'on' : '')} onClick={onChange}>
      <i className="sw" aria-hidden="true" />{children}
    </button>
  )
}
