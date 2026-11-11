# Architecture decision records

Short records of the decisions that shaped the project. Format: context → decision → consequences.

## ADR-1 · Keep a static React + Vite SPA (no backend, no microservices)
**Context.** The product is a classroom web page: no accounts, no shared state, no server-side secrets.
**Decision.** Stay with React 19 + Vite, JavaScript/JSX and static hosting. Do not persist student activity or inputs.
**Consequences.** Zero operations cost and trivial deployment. Anything needing shared data (a class leaderboard, say) would
require a backend; that would be a new module, not a reason to split what exists.

## ADR-2 · A pure `domain` layer and feature folders with an enforced dependency rule
**Context.** Physics, drawing, UI state and text were mixed in a few very large files (`PrismLab` 222 dense lines,
`Simulator` 310, `App` 209, `data.js` 344 mixing content, constants and computed problems). `optics.js` even imported from
`data.js` (the domain depending on content).
**Decision.** Split by responsibility into `domain / content / rendering / hooks / components / features`, one folder per
page section, with the rule in `docs/ARCHITECTURE.md` checked by `tests/architecture.test.js`.
**Consequences.** Physics is testable without a browser; sections can be rewritten independently. The price is more files;
the largest source file went from 310 to 219 lines.

## ADR-3 · Canvas renderers are pure functions of `(ctx, state)`
**Context.** Drawing code was inline in React components and could not be verified without a browser.
**Decision.** Extract renderers into `rendering/`. Tests use a recording `CanvasRenderingContext2D` to check invariants.
During the refactoring, the old and new renderers were compared call-by-call over hundreds of scenes (0 differences).
**Consequences.** Renderers can be refactored with confidence. They don't verify how the result *looks*.

## ADR-4 · Content separated from code
**Decision.** All text and data students edit live in `src/content` and `src/config`; related parallel arrays were merged
(for example conclusions text + metadata) and cryptic keys renamed (`t/p/i/c` → `title/text/icon/color`).
**Consequences.** Editing the site doesn't require touching logic. `tests/content.test.js` validates the data.

## ADR-5 · Problems are computed from the physics module
**Decision.** Answers, intermediate values and statements in `content/problems.js` are derived from `domain` functions.
**Consequences.** A change to a constant (for example the refractive index of water) updates statement, solution and
accepted answer together.

## ADR-6 · Decorative physics is decoupled from real physics
**Context.** The hero exaggerates dispersion so the seven colors are distinguishable.
**Decision.** `features/hero/heroBeam.js` uses the real tracer for the central ray and spreads the colors by a fixed angle;
its comments say it is not physically accurate. Labs use real, unexaggerated models.

## ADR-7 · Three.js loaded lazily, with a 2D fallback
**Decision.** `Hero3D` is a dynamic import; without WebGL, `Hero2DFallback` draws a flat prism.
**Consequences.** The initial bundle stays small; the heavy chunk (~500 kB) only loads for the hero.

## ADR-8 · Tests with Node's built-in runner; no new dependencies
**Context.** No test framework was installed, and adding one means more dependencies and a lockfile change.
**Decision.** `node --test` for pure modules (physics, content, renderers with a recording context, architecture rules)
and `scripts/check-bundle.mjs` (esbuild, already present through Vite) for the import graph.
**Consequences.** Nothing to install. Components with effects (React rendering in a DOM) are not unit-tested; adding
Vitest + Testing Library later is possible without changing this structure.

## ADR-9 · CSS layers instead of a CSS framework or CSS Modules
**Context.** ~70 KB of global CSS, tuned visually; `extra.css` had grown as a chronological patch log.
**Decision.** Keep global CSS, but organize it: `base.css → theme.css → features/*.css` with an explicit import order. The
patch log was split by feature after a script proved that no rule was lost and that no pair of rules that could conflict
changed order. 16 dead rules (unused classes) were removed.
**Consequences.** Visual output unchanged. Migrating to CSS Modules would be a larger, riskier change with no new capability.

## ADR-10 · Presentation mode reuses the page sections as slides
**Decision.** A hook toggles a CSS class on one `<main>` section at a time instead of maintaining a second deck of slides.
**Consequences.** There is a single source of truth for content, and every interactive section works inside a slide. The
coupling to the page structure (`main > section`) is documented in the hook.

## ADR-11 · Public URL via `VITE_SITE_URL`
**Decision.** `config/site.js` reads `import.meta.env.VITE_SITE_URL`, falling back to the deployed address.
**Consequences.** Staging and production QR codes can differ without code changes; no secrets are involved.

## ADR-12 · Removed the single-file build (`build.sh`) and the `motion` shim
**Context.** `build.sh` hard-coded paths of a different machine and a hand-written copy of the `motion` API (`motion-shim.jsx`)
existed only to support it; neither could run on a developer machine.
**Decision.** Remove both. `npm run build` is the supported build.
**Consequences.** If a single-HTML export is needed later, use a Vite plugin such as `vite-plugin-singlefile`.

## ADR-13 · Mystery-material grading uses the angle tolerance, like the water mode
**Context.** The original rule rejected a reading when the measured index was more than 8 % off. For the diamond at 30°, a
reading only 1° away already gives ~9 %, so honest students were told their measurement was "far off".
**Decision.** Validate the measurement with the same ±1.5° angle tolerance as the water mode, then check the chosen material.
Options are restricted to well-separated materials (water, glass, diamond).
**Consequences.** Consistent, fair feedback. Water and glass can still be confused at small angles with more than ~1° of reading
error; that is inherent to measuring and documented in the tests.
