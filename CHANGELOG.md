# Changelog

All notable changes to the project, newest first. Text shown to users stays in Spanish; everything else is in English.

## Unreleased — Review round 16
- **Section spacing and QR card:** moved section content below the wave dividers; constrained the presentation-mode QR card and synchronized its scroll fade with the hero copy.
- **README and project notes:** added three interface screenshots and updated stale references to persistence and removed components.

## Review round 15
- **Red laser:** the group's laser is now red everywhere in the experiment (setup lab, virtual practice protractor, texts, card
  colors, conclusions, docs). The free lab and the prism lab keep their selectable light color.
- **Print materials** (`design/print/`): corrected tri-fold and a new A3 poster, both with the QR code carrying the brand mark.

## Review round 14
- **QR with the brand mark:** the code now has the "L with a wave" mark in the middle on a white plate. It uses error
  correction level H (repairs up to 30 %) and the plate covers about 7 % of the modules, so it scans like a plain code
  (checked by decoding the rendered codes with OpenCV). The hero code is larger (108 px) for projectors.
- **Experiment:** more space between the group setup and the virtual practice (72 to 112 px).

## Review round 13
- **Experiment area joined like the rest of the page:** the tools (group setup, virtual practice) no longer sit in full-color
  bands with their own waves. They are plain content one after the other, and the only tint is the soft gradient at the start
  of the section, exactly like every other section. The empty strips between them are gone; the way into the free lab is the
  same single wave all sections use.

## Review round 12
- **Presentation mode, click and Space work the same everywhere:** each click (or tap) on empty space, and each Space / Enter,
  shows the next part of the slide and then moves to the next slide.
  - Fixed: on the first slide the decorative hero canvas swallowed every click.
  - A drag is not a click; two clicks within 280 ms count as one; holding Space / Enter advances only once.
  - After pressing a button, tab or chip the focus is released, so Space moves the slide instead of pressing the same
    control again. Clicks never select text while presenting.
  - Interactive slides (prism, experiment, free lab) only leave on a click in truly empty space, never while using a tool.
  - A short hint ("Clic o Espacio para avanzar…") shows for a few seconds when the presentation starts.

## Review round 11
- **Team roles:** Gabriel Robles is now the presenter (Expositor) and Eduardo Lopez solves problem 13.

## Review round 10
- **Removed "Ahora hazlo de verdad"** (materials, results table, steps checklist, photo upload) and the code behind it
  (`domain/experiment.js`, `useStoredState`, its tests). The group's setup and the virtual practice remain.
- **Critical angle:** the ready-made case now uses the exact critical angle (it used to be rounded down to 0.5°, so θ₂ stayed
  around 86°); the refracted ray skims along the surface, θ₂ = 90°, and the text explains it.
- **Rename:** "Simulador" is now "Laboratorio libre" (menu, section, tool guide, hero button).
- **Spacing:** smaller gaps between sections and between the experiment's tool bands.
- **Drop-downs:** n shown with a decimal comma; the material name is never cut off.

## Review round 9 (audit follow-up)
- **Physics wording:** "more dense / a higher n bends more" replaced by the correct rule (the relative index of both media
  decides; higher n₂ bends toward the normal, lower n₂ away, possibly total internal reflection).
- **Hero:** states the learning goal, says the spectrum is enlarged (not to scale), the course line no longer breaks in the
  middle of an item, and a QR card ("Compártelo con la clase") shows on desktop / projector only.
- **Prism lab:** note that the fan is drawn enlarged and the dispersion model is simplified.
- **Order:** the team section stays right below the hero (it introduces the members and their roles).
- **Numbers:** readouts, messages and canvas labels use the decimal comma; SVG geometry and CSV keep the point.
- **Presentation launcher:** shows "Exponer" and the `P` shortcut on wide screens.
- **Console:** fixed the duplicate React key `todas` (two siblings in Historia shared a key) and the invalid `stop-color`
  attribute in the application icons.
- **Docs:** one canonical site URL in CLAUDE.md and README.

## Review round 8
- **Hero / footer / tab title:** one course line, "Proyecto de Física · Reflexión y Refracción · 5to UNI · IV Bimestre ·
  Semana 36 · 2026" (`COURSE_LINE` in `src/config/site.js`); the term always comes before the week.
- **Sections menu:** closes when pressing anywhere outside it.
- **Drop-downs:** new themed `Select` component replaces the native `<select>` in the prism lab and the light lab.
- **Applications:** colorful illustrated icons (`AppIcon`) and a per-card accent color.
- **History:** Newton's figure draws a continuous rainbow wedge instead of separate stripes.
- **Favicon:** one mid-tone ink that reads on light and dark browser tabs.
- **Presentation mode:** fixed the problem figure overflowing its column (the `--pm-ratio` variable was never defined);
  revealed blocks keep clear of the toolbar; swipe left / right changes slide on touch screens; the toolbar is kept on
  phones (it used to be hidden, leaving no way to leave).

## Review round 7
- **Theme:** the page now follows the operating-system color scheme from the very first paint (no flash) and changes live
  when the system switches. The toggle button overrides it until the system changes again.
- **Logo:** the "L with a wave" mark is the active logo. It has no background; its neutral parts follow the text color
  in the page, and `public/logo.svg` / `public/favicon.svg` adapt to light and dark through `prefers-color-scheme`.
  Fixed-color variants live in `design/logos/`.
- **Prism lab:** beveled glass prism, flares where the beam enters and leaves the glass, wider and brighter rainbow fan,
  and "red / violet" tags that sit outside the band with a leader line (they no longer cover the rainbow).
- **Solved problems:** label plates use solid colors with white text. Fixed a style leak that stroked the label text in
  the color of the lines; separated overlapping labels in problem 13.
- **References:** one single list of sources (no history / theory groups). Removed EducaPlus and HyperPhysics.
- **Docs:** README rewritten (what each interactive tool is for, how to run, test and deploy); changelog translated.

## Review rounds 3 to 6
- Soft SVG wave dividers between sections; mobile overflow fixed in the virtual practice.
- New reference groups, curved section sheets, continuous white-light spectrum in the prism lab, conclusions cover every
  section.
- Larger history figure, draggable laser in the experiment setup, `ToolGuide` strip explaining the three interactive
  tools, per-tool color bands in the experiment, footer with interactions, one-line team list.
- Backgroundless logo proposals (`design/logos/`) and the solution drawn step by step over each problem figure.

## 2.0.0 — Architectural refactoring (no functional changes intended)

### Structure
- `App.jsx` (209 dense lines mixing theme, scroll-spy, nav, tabs, team, footer…) is now a ~50-line composition of sections.
- `data.js` split into `domain/` (constants, media, physics), `content/` (text and data) and `config/` (site URL, course).
  The domain no longer imports content.
- Each page section is a self-contained folder under `features/`; features never import each other (enforced by a test).
- `PrismLab` and `Simulator` split into domain functions, pure canvas renderers, hooks and presentational components.
- `Present.jsx` split into small hooks (slides, fullscreen, idle timeout, timer, keyboard) and a toolbar component.
- `Hero3D` split into scene factory (`heroScene.js`), beam optics (`heroBeam.js`) and a React wrapper.
- CSS reorganized into `styles/base.css → theme.css → features/*.css`; the 31 KB patch log `extra.css` was split by feature.

### Removed
- Duplicated logic: three decimal parsers, two percent-error formulas, three refracted-angle formulas, three canvas-setup
  blocks, two touch-guard effects, duplicated toggle and logo markup.
- Dead code: `Tilt`, a stale `qrcode.cjs`, unused exports and variables, the unused "streak" counter of the virtual lab.
- `build.sh` and `motion-shim.jsx` (a single-file build that only worked on one machine; see ADR-12).

### Added
- Automated tests (`npm test`): physics, experiments, content integrity, renderers, architecture rules.
- `npm run check` (import-graph check) and `npm run verify` (test + check + build).
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/LICENSE-DECISION.md`, `LICENSE` (decision pending),
  `.editorconfig`, `.prettierrc.json`, `.gitignore`, `.env.example`, and `VITE_SITE_URL` for the public URL.

### Behavior notes
- **Fixed** — mystery-material mode rejected honest readings of the diamond at small angles; it now uses the same ±1.5°
  tolerance as the water mode (ADR-13).
- **Aligned** — all inputs use the same strict decimal parsing (`"14.9abc"` is no longer accepted).
- **Aligned** — leaving fullscreen with Esc while presenting also scrolls back to the slide you were on.
- Apex-angle easing in the prism lab settles at a 0.03° threshold instead of 0.004° (visually identical).

## Earlier iterations (before 2.0.0)
- **Presentation mode:** one full-screen slide per section, compact bar (previous / next, progress dots, stopwatch, exit),
  `Esc` and `P` shortcuts, steps inside a slide with click / `Space` / `Enter`.
- **Layout and navigation:** the page order is Home → Team → History → Key ideas → Comparison → Prism → Applications →
  Experiment → Simulator → Problems → Conclusions → References; the menu, footer and presentation mode follow it.
  Course data lives in one place and shows on the hero, the footer and the tab title.
- **Key ideas:** angles are marked with a translucent wedge and an arc, with equality marks for reflection and arrows for
  the direction of the light.
- **History:** is chronological, from antiquity to Huygens; on phones the timeline is vertical and reveals itself on scroll.
- **Hero:** glass with a subtle iridescent reflection, flares where light enters and leaves, glow under the prism.
- **Virtual lab:** "mystery material" with well-separated options (water, glass, diamond), validated readings and strict
  text input (dot or comma).
- **Mobile and touch:** 44 px touch targets, swipeable color chips in the prism lab, the simulator is aimed only by
  touching near the laser, the page scrolls freely over canvases.
- **Performance:** static canvas layers drawn off screen (each frame redraws only waves and the laser ring), animation
  loops paused when off screen, 30 fps and 1.5× resolution on touch devices, lazy-started 3D hero with a lighter mobile
  quality, CSS-only `Reveal`, no `backdrop-filter` on touch screens.
- **Single-file build:** `npx vite build -c vite.single.config.js` (needs `vite-plugin-singlefile`).