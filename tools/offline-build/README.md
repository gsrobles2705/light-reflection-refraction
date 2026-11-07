# Offline single-file build

`node tools/offline-build/build.mjs [output.html]` produces one shareable HTML file using only `esbuild`, `react` and
`react-dom`. It replaces `motion/react` with `motion-react.jsx` (Web Animations API) and the 3D hero with `heroScene.js`
(returns `null`, so the hero shows its 2D prism). Use `npx vite build -c vite.single.config.js` whenever you can install
dependencies: that build is the exact one.

If `motion/react` gains a new API (for example `whileInView`), add it to `motion-react.jsx` or the offline build ignores it.
