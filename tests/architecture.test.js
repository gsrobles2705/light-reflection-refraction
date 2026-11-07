import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

// Enforces the dependency rules documented in docs/ARCHITECTURE.md, so the layering cannot erode unnoticed.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]))
const sources = walk(ROOT).filter((file) => /\.(js|jsx)$/.test(file) && !file.includes('qrcode'))
const layerOf = (file) => relative(ROOT, file).split(/[\\/]/)[0].replace(/\.(js|jsx)$/, '')   // 'domain', 'features', 'App', …
const featureOf = (file) => (layerOf(file) === 'features' ? relative(ROOT, file).split(/[\\/]/)[1] : null)

/** [{ from, to }] for every relative import (static or dynamic) inside src/. */
const imports = sources.flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/(?:from|import\()\s*'(\.[^']+)'/g)].map((match) => ({ from: file, to: join(dirname(file), match[1]) })))

// Which layers each layer may depend on (besides itself). Anything not listed is forbidden.
const ALLOWED = {
  config: [],
  assets: [],
  domain: [],
  lib: [],
  content: ['domain'],
  rendering: ['domain', 'lib'],
  hooks: ['domain', 'lib', 'rendering'],
  components: ['domain', 'lib', 'hooks', 'config'],
  features: ['domain', 'lib', 'rendering', 'hooks', 'components', 'content', 'config', 'assets'],
  App: ['domain', 'lib', 'rendering', 'hooks', 'components', 'content', 'config', 'features'],
  main: ['App', 'styles'],
}

test('every layer only depends on the layers it is allowed to', () => {
  const violations = imports.filter(({ from, to }) => {
    const source = layerOf(from), target = layerOf(to)
    return target !== source && !ALLOWED[source]?.includes(target)
  }).map(({ from, to }) => `${relative(ROOT, from)} → ${relative(ROOT, to)}`)
  assert.deepEqual(violations, [])
})

test('features are independent of each other', () => {
  const violations = imports.filter(({ from, to }) => featureOf(from) && featureOf(to) && featureOf(from) !== featureOf(to)).map(({ from, to }) => `${relative(ROOT, from)} → ${relative(ROOT, to)}`)
  assert.deepEqual(violations, [])
})

test('the domain layer does not touch the browser', () => {
  const browserApis = /\b(document|window|localStorage|navigator|requestAnimationFrame|matchMedia|devicePixelRatio)\b/
  const offenders = sources.filter((file) => layerOf(file) === 'domain' && browserApis.test(readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')))
  assert.deepEqual(offenders.map((file) => relative(ROOT, file)), [])
})

test('the domain layer has no React dependency', () => {
  const offenders = sources.filter((file) => layerOf(file) === 'domain' && /from 'react|from 'motion|from 'three/.test(readFileSync(file, 'utf8')))
  assert.deepEqual(offenders.map((file) => relative(ROOT, file)), [])
})

test('no source file is dead: every module is imported by another one (or is an entry point)', () => {
  const imported = new Set(imports.flatMap(({ to }) => { const base = to.replace(/\.(js|jsx)$/, ''); return [base, join(base, 'index')] }))   // `from './dir'` resolves to dir/index.js
  const entries = new Set(['main', 'App'])
  const orphans = sources.filter((file) => !imported.has(file.replace(/\.(js|jsx)$/, '')) && !entries.has(relative(ROOT, file).replace(/\.(js|jsx)$/, '')))
  assert.deepEqual(orphans.map((file) => relative(ROOT, file)), [])
})
