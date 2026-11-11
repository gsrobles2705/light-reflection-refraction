import { useId } from 'react'
import { ACTIVE_LOGO, LOGO_MARKS } from './logoMarks.js'

/** Logo without a background: neutral parts follow the text color, the spectrum is a gradient. See logoMarks.js for the proposals. */
export default function BrandMark() {
  const id = 'bm' + useId().replace(/:/g, ''), logo = LOGO_MARKS.find((item) => item.id === ACTIVE_LOGO) || LOGO_MARKS[0]
  return <svg viewBox="0 0 48 48" aria-hidden="true" dangerouslySetInnerHTML={{ __html: logo.inner(id) }} />
}
