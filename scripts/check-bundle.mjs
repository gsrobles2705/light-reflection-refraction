// Static sanity check of the import graph: bundles the app in memory (no output files) so syntax errors, unresolved
// imports and missing named exports fail fast, without a browser. It uses esbuild, which ships with Vite.
import { build } from 'esbuild'

const result = await build({
  entryPoints: ['src/main.jsx'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.js': 'jsx', '.css': 'empty', '.jpg': 'empty' },
  logLevel: 'silent',
  define: { 'import.meta.env': '{}' },
}).catch((error) => {
  console.error(error.errors?.map((e) => `${e.location?.file}:${e.location?.line} ${e.text}`).join('\n') || error)
  process.exit(1)
})

console.log(`Import graph OK (${result.outputFiles.length} output chunk).`)
