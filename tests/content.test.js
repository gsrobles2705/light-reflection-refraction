import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { APPLICATIONS } from '../src/content/applications.js'
import { CONCLUSIONS } from '../src/content/conclusions.js'
import { EXPERIMENT_STEPS } from '../src/content/experiment.js'
import { HISTORY } from '../src/content/history.js'
import { NAV_ITEMS, visibleNavItems } from '../src/content/navigation.js'
import { PRISM_STORY, SPECTRUM_CHIPS } from '../src/content/prismLab.js'
import { PROBLEMS } from '../src/content/problems.js'
import { MILK_ML, beamLook, beamState, levelFraction, reflectedFraction, setupReadout } from '../src/domain/setup.js'
import { INDEX_ROWS, SNELL_EXAMPLE, THEORY_TOPICS } from '../src/content/theory.js'
import { TEAM, visibleTeam } from '../src/content/team.js'
import { SCENARIOS } from '../src/features/simulator/scenarios.js'
import { DEFAULT_PRISM_SETTINGS } from '../src/domain/prism.js'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const walk = (dir) => readdirSync(new URL('../' + dir + '/', import.meta.url), { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]))
// Icon.jsx is JSX (not importable from Node), so the available icon names are read from its source: `name: 'M…path…'`
const iconNames = [...read('src/components/Icon.jsx').matchAll(/\b([a-zA-Z]+): '[Mm][^']*'/g)].map((match) => match[1])

test('navigation: unique ids, and the page renders exactly those sections in the same order', () => {
  const ids = NAV_ITEMS.map((item) => item.id)
  assert.equal(new Set(ids).size, ids.length)
  const featureSource = walk('src/features').filter((file) => file.endsWith('.jsx')).map((file) => [file, read(file)])
  const app = read('src/App.jsx')
  const sectionOf = (id) => featureSource.find(([, source]) => source.includes(`<section id="${id}"`))
  const componentOf = (id) => sectionOf(id)?.[0].split(/[\\/]/).pop().replace('.jsx', '')
  for (const id of ids) assert.ok(sectionOf(id), `no component renders <section id="${id}">`)
  // order of the components in App.jsx = order of NAV_ITEMS
  const positions = ids.map((id) => app.indexOf(`<${componentOf(id)}`))
  assert.ok(positions.every((position, i) => position >= 0 && (i === 0 || position > positions[i - 1])), `App.jsx order differs from NAV_ITEMS: ${positions}`)
  assert.equal(visibleNavItems(false).some((item) => item.id === 'integrantes'), false)
  assert.equal(visibleNavItems(true).length, NAV_ITEMS.length)
})

test('every nav id has an accent color variable in the CSS', () => {
  const css = walk('src/styles').filter((file) => file.endsWith('.css')).map(read).join('\n')
  for (const { id } of NAV_ITEMS) assert.ok(css.includes(`--h-${id}`), `--h-${id} is not defined`)
})

test('history is chronological and complete', () => {
  const yearOf = (text) => { const value = parseInt(text.replace(/[^0-9]/g, ''), 10); return /a\. C\./.test(text) ? -value : value }
  const years = HISTORY.map((event) => yearOf(event.year))
  assert.deepEqual(years, [...years].sort((a, b) => a - b), 'events must be sorted by year')
  assert.equal(HISTORY.filter((event) => event.highlight).length, 1, 'exactly one highlighted event')
  for (const event of HISTORY) for (const field of ['year', 'who', 'place', 'title', 'color', 'text', 'why']) assert.ok(event[field], `${event.year} lacks ${field}`)
})

test('theory topics, diagrams and conclusions line up', () => {
  assert.equal(THEORY_TOPICS.length, 3, 'Diagram.jsx draws exactly three kinds (0, 1, 2)')
  for (const topic of THEORY_TOPICS) assert.ok(topic.cards.length > 0 && topic.cards.every((card) => card.title && (card.text || card.kind)), topic.id)
  for (const topic of THEORY_TOPICS) for (const card of topic.cards) {
    if (card.kind === 'legend') assert.ok(topic.legend?.length >= 5, 'legend items')
    if (card.kind === 'daily') assert.ok(card.items?.length >= 2, 'daily examples')
  }
  for (const conclusion of CONCLUSIONS) assert.ok(conclusion.diagram === null || (conclusion.diagram >= 0 && conclusion.diagram < THEORY_TOPICS.length), conclusion.title)
})

test('theory: speeds follow v = c / n and the worked example matches the written result', () => {
  assert.deepEqual(INDEX_ROWS.map((row) => row.n), [1, 1.33, 1.5, 2.42])
  assert.equal(INDEX_ROWS[0].speed.replace(/\s/g, ''), '300000')
  assert.equal(INDEX_ROWS[2].speed.replace(/\s/g, ''), '200000')
  assert.ok(Math.abs(SNELL_EXAMPLE.sine - 0.376) < 0.001 && Math.round(SNELL_EXAMPLE.a2) === 22)
  assert.ok(SNELL_EXAMPLE.steps.some((step) => step.math.includes('22°')))
})

test('icons referenced by the content exist', () => {
  assert.ok(iconNames.length > 20, 'the icon names must be readable from Icon.jsx')
  const used = [...APPLICATIONS.map((app) => app.icon), ...SCENARIOS.map((scenario) => scenario.icon)]
  for (const name of used) assert.ok(iconNames.includes(name), `unknown icon "${name}"`)
})

test('prism story only uses known settings and the chips cover the visible spectrum', () => {
  for (const step of PRISM_STORY) for (const key of Object.keys(step.settings)) assert.ok(key in DEFAULT_PRISM_SETTINGS, `unknown setting "${key}"`)
  const wavelengths = SPECTRUM_CHIPS.map((chip) => chip.wavelength)
  assert.deepEqual(wavelengths, [...wavelengths].sort((a, b) => a - b))
  assert.ok(wavelengths[0] <= 420 && wavelengths.at(-1) >= 650)
})

test('experiment steps are present', () => assert.ok(EXPERIMENT_STEPS.length >= 3 && EXPERIMENT_STEPS.every((step) => step.title && step.text)))

test('solved problems: the marked option matches the computed value', () => {
  assert.deepEqual(PROBLEMS.map((problem) => problem.id), [10, 11, 13])
  for (const problem of PROBLEMS) {
    assert.ok(problem.steps.length >= 4 && problem.steps.every((step) => step.title && step.text), `steps of problem ${problem.id}`)
    assert.equal(problem.options.length, 5)
    const closest = problem.options.reduce((best, option) => Math.abs(option.value - problem.value) < Math.abs(best.value - problem.value) ? option : best)
    assert.equal(closest.key, problem.answer, `problem ${problem.id}`)
    assert.ok(Math.abs(closest.value - problem.value) < 0.06*Math.max(1, Math.abs(problem.value)), `problem ${problem.id} value ${problem.value}`)
    assert.ok(problem.steps.some((step) => step.figure), 'one step shows the diagram')
  }
  assert.ok(Math.abs(PROBLEMS[0].value - 1.299) < 0.001)
  assert.ok(Math.abs(PROBLEMS[1].value - 53.13) < 0.01)
  assert.ok(Math.abs(PROBLEMS[2].value - Math.SQRT2) < 1e-9)
})

test('team: placeholders only show while developing', () => {
  assert.equal(visibleTeam(true).length, TEAM.length)
  assert.ok(visibleTeam(false).every((member) => member.name))
})

test('no Spanish comments are left in the JavaScript sources', () => {
  const commentOf = (line) => line.match(/(?:^|\s)(\/\/\s.*|\/\*.*|\*\s.*)$/)?.[1] ?? ''
  const spanish = /\b(el|la|los|las|una|del|para|que|con|este|esta|cuando|porque|entre|desde|sobre|también|según)\b|[áéíóúñ¿¡]/i
  const offenders = walk('src').filter((file) => /\.(js|jsx)$/.test(file) && !file.includes('qrcode')).flatMap((file) => read(file).split('\n').map((line, i) => [file, i + 1, commentOf(line)]).filter(([, , comment]) => comment && spanish.test(comment)))
  assert.deepEqual(offenders.map(([file, line]) => `${file}:${line}`), [])
})

test('setup lab: water level, milk zones and the reflected light', () => {
  assert.equal(levelFraction(2), 1)
  assert.ok(Math.abs(levelFraction(1.8) - 0.9) < 1e-9)
  assert.deepEqual([2.5, 3, 4.5, 6, 6.5].map(beamState), ['faint', 'ideal', 'ideal', 'ideal', 'cloudy'])
  assert.ok(beamLook(0).core < beamLook(3).core && beamLook(8).reach < beamLook(6).reach, 'milk shows the beam, too much clouds it')
  assert.ok(Math.abs(reflectedFraction(1, 1.333, 0) - 0.0204) < 0.001, 'normal incidence reflects about 2 %')
  assert.ok(reflectedFraction(1, 1.333, 80) > reflectedFraction(1, 1.333, 45), 'more reflection at larger angles')
  const readout = setupReadout({ waterLiters: 1.9, milkMl: MILK_ML.initial, incidentDegrees: 30 })
  assert.ok(readout.refractedDegrees < 30 && readout.reflectedDegrees === 30, 'refracted ray gets closer to the normal; reflection keeps the angle')
})
