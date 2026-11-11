import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildPrismGeometry, DEFAULT_PRISM_SETTINGS } from '../src/domain/prism.js'
import { advancePointer, drawHeroFallback } from '../src/rendering/heroFallbackRenderer.js'
import { renderPrismLab } from '../src/rendering/prismLabRenderer.js'
import { renderSimulator } from '../src/rendering/simulatorRenderer.js'
import { buildSimulatorModel, DEFAULT_SCENE } from '../src/rendering/simulatorModel.js'
import { createRecordingContext } from './helpers/recordingContext.js'

const PALETTE = { bg: '#080a18', a: '#4de3ff', b: '#a98bff', ray: '#7cff6b', ink: '#fff', mute: '#9aa', err: '#ff6b6b', at: '#ffb347', bt: '#4de3ff', rayT: '#7cff6b' }
const count = (calls, name) => calls.filter(([call]) => call === name).length

/** Common invariants of a well-behaved frame: balanced save/restore and no leaked global state. */
function assertCleanFrame({ calls, state }, label) {
  assert.equal(count(calls, 'save'), count(calls, 'restore'), `${label}: save/restore must be balanced`)
  assert.ok(calls.length > 50, `${label}: a frame should draw something`)
  assert.ok(calls.every(([call, ...args]) => call === 'set' || args.every((value) => typeof value !== 'number' || Number.isFinite(value))), `${label}: no NaN/Infinity coordinates`)
  assert.equal(state.globalCompositeOperation === undefined || state.globalCompositeOperation === 'source-over' || state.globalCompositeOperation === 'lighter', true)
}

test('simulator renderer: every medium pair, mode and toggle draws a clean frame', () => {
  for (const mode of ['interface', 'slab']) for (const [firstMedium, secondMedium] of [[0, 2], [2, 0], [5, 0], [0, 6], [3, 3]]) for (const incidentAngle of [0, 30, 49, 70, 89]) for (const showArcs of [true, false]) {
    const scene = { ...DEFAULT_SCENE, mode, firstMedium, secondMedium, incidentAngle, showArcs, showProtractor: showArcs }
    const recording = createRecordingContext()
    renderSimulator(recording.ctx, scene, buildSimulatorModel(scene), { time: 1.3, palette: PALETTE, rayColor: '#7cff6b', scale: 1.4 })
    assertCleanFrame(recording, `${mode} ${firstMedium}→${secondMedium} ${incidentAngle}°`)
  }
})

test('simulator renderer: the laser hint can be hidden', () => {
  const draw = (showNames) => { const scene = { ...DEFAULT_SCENE, showNames }, recording = createRecordingContext(); renderSimulator(recording.ctx, scene, buildSimulatorModel(scene), { time: 0, palette: PALETTE, rayColor: '#fff', scale: 1 }); return recording.calls.filter(([call, text]) => call === 'fillText' && text === 'arrastra el láser').length }
  assert.equal(draw(true), 1)
  assert.equal(draw(false), 0)
})

test('prism lab renderer: cross-fade states draw clean frames', () => {
  const states = [
    { settings: DEFAULT_PRISM_SETTINGS, blend: { prismOpacity: 1, pairOpacity: 0, whiteMix: 1 } },
    { settings: { ...DEFAULT_PRISM_SETTINGS, newtonPair: true, rotation: 24, pairGap: 12 }, blend: { prismOpacity: 1, pairOpacity: 1, whiteMix: 1 } },
    { settings: { ...DEFAULT_PRISM_SETTINGS, whiteLight: false, wavelength: 450 }, blend: { prismOpacity: 1, pairOpacity: 0, whiteMix: 0 } },
    { settings: { ...DEFAULT_PRISM_SETTINGS, prismHidden: true }, blend: { prismOpacity: 0, pairOpacity: 0, whiteMix: 0 } },
    { settings: DEFAULT_PRISM_SETTINGS, blend: { prismOpacity: 0.4, pairOpacity: 0.5, whiteMix: 0.5 } },   // mid-transition
  ]
  for (const { settings, blend } of states) {
    const recording = createRecordingContext(), geometry = buildPrismGeometry({ ...settings, newtonPair: blend.pairOpacity > 0.01 })
    renderPrismLab(recording.ctx, settings, geometry, 530, blend, { time: 0.5, scale: 1.2 })
    assertCleanFrame(recording, JSON.stringify(blend))
  }
})

test('hero fallback renderer: dark and light themes, wide and narrow screens', () => {
  for (const dark of [true, false]) for (const width of [1280, 390]) {
    const recording = createRecordingContext(), pointer = { x: 0.62, y: 0.5, targetX: 0.3, targetY: 0.7 }
    advancePointer(pointer)
    drawHeroFallback(recording.ctx, { width, height: 800 }, pointer, 1, dark)
    assert.ok(pointer.x < 0.62 && pointer.x > 0.3, 'the pointer eases toward its target')
    assert.ok(count(recording.calls, 'stroke') >= 3 && count(recording.calls, 'fill') >= 20, 'prism lines plus a filled spectrum wedge')
  }
})
