/**
 * Fake CanvasRenderingContext2D that records every call and property write. It lets renderer tests run in Node
 * (no browser) and check invariants such as balanced save/restore.
 */
export function createRecordingContext() {
  const calls = []
  const state = {}
  const METHODS = new Set(['save', 'restore', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'stroke', 'fill', 'fillRect', 'clearRect', 'fillText', 'translate', 'rotate', 'scale', 'setLineDash', 'roundRect', 'rect'])
  const gradient = () => ({ addColorStop: () => {} })
  const ctx = new Proxy({}, {
    get(_, property) {
      if (property === 'createLinearGradient' || property === 'createRadialGradient') return () => gradient()
      if (property === 'measureText') return (text) => ({ width: String(text).length * 7 })
      if (METHODS.has(property)) return (...args) => calls.push([property, ...args])
      return state[property]
    },
    set(_, property, value) { state[property] = value; calls.push(['set', property, value]); return true },
  })
  return { ctx, calls, state }
}
