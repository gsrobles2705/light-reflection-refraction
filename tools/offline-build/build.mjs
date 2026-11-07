// Builds one self-contained HTML file with esbuild when `vite`, `motion` or `three` cannot be installed (no internet).
// Differences from the real build: `motion/react` is replaced by a small Web Animations implementation and the 3D hero
// scene is skipped (the hero falls back to its 2D prism). For the exact build use: npx vite build -c vite.single.config.js
//
// Usage: node tools/offline-build/build.mjs [output.html]
// Env:   ESBUILD=<path to esbuild main.js> (default: the `esbuild` package) · EXTRA_MODULES=<folder with react and react-dom>
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '../..')
const { build } = await import(process.env.ESBUILD ? pathToFileURL(process.env.ESBUILD).href : 'esbuild')
const output = path.resolve(process.argv[2] || path.join(root, 'luz-en-movimiento.html'))

const result = await build({
  entryPoints: [path.join(root, 'src/main.jsx')], bundle: true, minify: true, write: false, outdir: path.join(here, '.out'), format: 'iife', target: 'es2020',
  jsx: 'automatic', loader: { '.js': 'jsx', '.jpg': 'dataurl', '.png': 'dataurl' }, legalComments: 'none',
  nodePaths: [process.env.EXTRA_MODULES, path.join(root, 'node_modules')].filter(Boolean),
  alias: { 'motion/react': path.join(here, 'motion-react.jsx') },
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env': '{"DEV":false,"PROD":true}' },
  plugins: [{ name: 'hero-stub', setup: (b) => b.onResolve({ filter: /heroScene\.js$/ }, () => ({ path: path.join(here, 'heroScene.js') })) }],
})
const file = (extension) => result.outputFiles.find((item) => item.path.endsWith(extension))?.text ?? ''
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace('</head>', () => `<style>${file('.css')}</style>\n</head>`)
  .replace(/<script type="module" src="\/src\/main.jsx"><\/script>/, () => `<script>${file('.js').replace(/<\/script>/g, '<\\/script>')}</script>`)
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, html)
console.log(`${output} (${Math.round(html.length/1024)} KB)`)
