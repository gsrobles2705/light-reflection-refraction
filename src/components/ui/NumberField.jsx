/** Text input with a unit suffix (°, ×10⁸ m/s…) kept outside the placeholder. Decimal keypad on mobile. */
export default function NumberField({ suffix, label, className = '', ...inputProps }) {
  return (
    <span className={'field ' + className}>
      <input className="num" inputMode="decimal" aria-label={label} {...inputProps} />
      {suffix && <span className="suf" aria-hidden="true">{suffix}</span>}
    </span>
  )
}
