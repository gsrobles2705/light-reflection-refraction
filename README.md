# Luz en Movimiento — Reflexión y Refracción

Interactive web project about the **reflection and refraction of light**, built for a high-school physics course
(5to UNI · Física · IV Bimestre). It is meant to be projected in class: students open it on their phones by scanning the
QR code shown on the first screen.

> **Resumen (ES):** sitio interactivo hecho con React + Vite. La física vive en `src/domain` (funciones puras con
> pruebas), el contenido editable en `src/content` y cada sección de la página en `src/features/<sección>`.
> Para editar textos, integrantes o problemas, ver [«Editing the content»](#editing-the-content). Comandos útiles:
> `npm run dev`, `npm test`, `npm run verify`.

## What it includes

| Section                  | What the user can do                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Hero                     | 3D glass prism that follows the pointer (2D fallback without WebGL), QR code to open the site                             |
| Team                     | Member cards (placeholders only appear in development)                                                                    |
| History                  | Timeline from Euclid to Newton (horizontal on desktop, vertical and scroll-revealed on phones)                            |
| Key ideas                | Reflection, refraction and total internal reflection, with animated ray diagrams                                          |
| Prism lab                | Scroll-driven story + draggable prism and laser, white-light dispersion, Newton's two-prism experiment                    |
| Applications             | Real-life uses (rainbow, optical fiber, mirages, lenses…)                                                                 |
| Experiment               | Virtual protractor lab (water / mystery material) and the real water experiment with results table, CSV export and photos |
| Simulator                | Light lab: media, angle and color, critical angle, total internal reflection, glass slab                                  |
| Problems                 | Four solved problems with instant feedback and saved progress                                                             |
| Conclusions · References | Wrap-up and sources                                                                                                       |

Extras: light/dark theme, compact navigation, **presentation mode** (one full-screen slide per section, keyboard
navigation, stopwatch) and fullscreen.

The physics is deliberately kept at **high-school level**: Snell's law, refractive index, critical angle, total internal
reflection and color dispersion. No Fresnel equations, polarization or Brewster angle.

## Tech stack

- **React 19** + **Vite 6** (JavaScript, JSX, no TypeScript)
- **motion** (Framer Motion) for UI animation
- **Three.js**, loaded lazily, only for the hero prism
- Canvas 2D for the prism lab and the simulator, SVG for diagrams and the virtual lab
- Plain CSS (layered, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md))
- Tests with Node's built-in runner (`node:test`): **no extra dev dependencies**

## Prerequisites

- Node.js **20 or newer** (22 recommended) and npm

## Install and run

```bash
npm install
npm run dev        # development server (http://localhost:5173), shows placeholders for unfinished team entries
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## Configuration

| Variable        | Default                             | Purpose                                                     |
| --------------- | ----------------------------------- | ----------------------------------------------------------- |
| `VITE_SITE_URL` | `https://fisica.5touni.workers.dev` | Public address shown in the hero and encoded in the QR code |

Copy `.env.example` to `.env` to override it. Only `VITE_`-prefixed variables reach the browser: never store secrets
there. Course data (classroom, week, term…) lives in `src/config/site.js`.

## Scripts

| Command          | What it does                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`       | Runs the unit, content, architecture and renderer tests (`tests/`)                                                               |
| `npm run check`  | Bundles the app in memory to catch syntax errors, unresolved imports and missing exports (uses the esbuild that ships with Vite) |
| `npm run verify` | `test` + `check` + `build`: run it before every commit/deploy                                                                    |

## Project structure

```
src/
  main.jsx            entry point (providers + styles)
  App.jsx             page composition: section order must match content/navigation.js
  config/             deployment settings and constants (site URL, course data, palette)
  domain/             pure physics and rules: no React, no DOM  ← the core, fully unit-tested
  content/            editable text and data (history, theory, problems, team…)
  rendering/          canvas drawing as pure functions of (context, state), plus the simulator's scene model
  hooks/              reusable React hooks (theme, canvas loop, storage, touch guard…)
  lib/                small browser utilities (canvas setup, clipboard, theme transition, vendored QR library)
  components/         shared presentational components (icons, diagrams, UI primitives)
  features/<name>/    one folder per page section; features never import each other
  styles/             base.css → theme.css → features/*.css (see index.css for the load order)
tests/                node:test suites + a recording canvas context
scripts/              check-bundle.mjs
docs/                 architecture, decision records, license options
```

Dependency rule (enforced by `tests/architecture.test.js`):
`features → hooks / rendering / components / content → domain`. The `domain` layer imports nothing from the rest of the
project, and never touches the browser.

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for diagrams, module contracts and data flow, and
**[docs/DECISIONS.md](docs/DECISIONS.md)** for why things are the way they are.

## Editing the content

Nothing about the physics needs to change to edit the site; everything editable is in `src/content` and `src/config`:

| To change…                                                | Edit                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Team members (name, role, photo in `public/equipo/`)      | `src/content/team.js`                                                                                               |
| Course info (classroom, week, term, topic) and public URL | `src/config/site.js` / `.env`                                                                                       |
| History timeline                                          | `src/content/history.js` (keep it chronological; exactly one event has `highlight: true`)                           |
| Key ideas, applications, conclusions, references          | `theory.js`, `applications.js`, `conclusions.js`, `references.js`                                                   |
| Solved problems                                           | `src/content/problems.js` (answers are computed with the physics module, so statement and solution stay consistent) |
| Experiment steps and materials                            | `src/content/experiment.js`                                                                                         |
| Prism-lab story steps                                     | `src/content/prismLab.js`                                                                                           |
| Ready-made simulator cases                                | `src/features/simulator/scenarios.js`                                                                               |

`npm test` validates the content (valid icons, chronological history, consistent navigation, etc.).

### Adding a new page section

1. Create `src/features/<name>/<Name>Section.jsx` that renders `<section id="<id>">`.
2. Add `{ id, label }` to `src/content/navigation.js` and the accent color `--h-<id>` in `src/styles/theme.css`.
3. Render it in `src/App.jsx` **in the same position** as in the navigation list.
4. Put its styles in `src/styles/features/<name>.css` and import it in `src/styles/index.css`.
5. Run `npm run verify`: the tests fail if the navigation, the sections or the dependency rules disagree.

## Testing

```bash
npm test
```

What is covered:

- **Physics** (`optics`, `rayTracing`, `prism`, `interfaceModel`): Snell's law, critical angles, total internal
  reflection boundaries, dispersion order, minimum deviation of a prism (27.3° for the flint example), Newton's
  recombination, slab lateral shift, no NaN/Infinity over the full angle range.
- **Experiments**: expected angles, input parsing, grading tolerances, and that the "mystery material" options stay distinguishable.
- **Content integrity**: navigation ↔ sections ↔ `App.jsx` order, history order, icon names, problem answers.
- **Renderers**: every medium pair / mode / transition state draws a balanced, finite frame (using a recording canvas context).
- **Architecture**: layering rules, no dead modules, no browser APIs in `domain`, English-only comments.

Not covered automatically: real browser behavior (WebGL hero, touch gestures, fullscreen) and visual appearance.
Check those manually on a desktop and a phone before presenting.

## Deployment

`npm run build` produces a static site in `dist/` that can be hosted anywhere (Cloudflare Workers/Pages, Netlify,
Vercel, GitHub Pages). Set `VITE_SITE_URL` to the final address **before building** so the QR code points to it, then scan the
QR from a phone on mobile data to verify.

## Contributing

1. Create a branch and keep changes small and focused.
2. Put physics in `src/domain` (with a test), text in `src/content`, drawing in `src/rendering`, UI in `src/features/<name>`.
3. Write code comments in English; user-facing text stays in Spanish.
4. Run `npm run verify` and check the page in a browser (desktop and phone) before opening a pull request.
5. Formatting: `.editorconfig` and `.prettierrc.json` describe the style (no semicolons, single quotes). Format only the files you touch.

## License

**No license has been chosen yet.** See [LICENSE](LICENSE) and [docs/LICENSE-DECISION.md](docs/LICENSE-DECISION.md).
Third-party software keeps its own licenses (React, Vite, motion, Three.js: MIT; `src/lib/qrcode.js`: MIT, © 2009 Kazuhiko Arase).
