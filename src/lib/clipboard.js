/** Copies text to the clipboard. Falls back to a hidden textarea for browsers without the async Clipboard API. Returns success. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const field = document.createElement('textarea')
      field.value = text
      document.body.appendChild(field)
      field.select()
      const copied = document.execCommand('copy')
      field.remove()
      return copied
    } catch {
      return false
    }
  }
}

/** Triggers a browser download of `content`. Returns success. */
export function downloadText(content, filename, mimeType) {
  try {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([content], { type: mimeType }))
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
    return true
  } catch {
    return false
  }
}
