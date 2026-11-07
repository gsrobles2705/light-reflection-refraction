# Changelog

## Unreleased — Review round from annotated screenshots
- History: larger figure on the timeline card (wider layout, height-limited so it never overflows).
- Experiment setup: the laser can be dragged with the pointer; angles inside the drawing show degrees instead of symbols; softer glow under the card.
- New `ToolGuide` strip (what each of the three interactive tools is for) above the setup, the practice and the light lab; duplicated practice title removed.

## 2.0.0 — Architectural refactoring (no functional changes intended)

### Structure
- `App.jsx` (209 dense lines mixing theme, scroll-spy, nav, tabs, team, footer…) is now a ~50-line composition of sections.
- `data.js` split into `domain/` (constants, media, physics), `content/` (text and data) and `config/` (site URL, course).
  The domain no longer imports content.
- Each page section is a self-contained folder under `features/`; features never import each other (enforced by a test).
- `PrismLab` (physics + drawing + animation + interaction + UI in one file) and `Simulator` split into domain functions,
  pure canvas renderers, hooks and presentational components.
- `Present.jsx` split into small hooks (slides, fullscreen, idle timeout, timer, keyboard) and a toolbar component.
- `Hero3D` split into scene factory (`heroScene.js`), beam optics (`heroBeam.js`) and a React wrapper.
- CSS reorganized into `styles/base.css → theme.css → features/*.css`; the 31 KB patch log `extra.css` was split by feature
  (verified: no rule lost, no conflicting pair reordered). 16 dead rules removed.

### Removed
- Duplicated logic: three decimal parsers, two percent-error formulas, three refracted-angle formulas, three canvas-setup
  blocks, two touch-guard effects, duplicated toggle and logo markup.
- Dead code: `Tilt`, `qrcode.cjs` (a stale duplicate of `qrcode.js`), unused exports and variables, the unused "streak"
  counter of the virtual lab.
- `build.sh` and `motion-shim.jsx` (single-file build that only worked on another machine; see ADR-12).

### Added
- 67 automated tests (`npm test`): physics, experiments, content integrity, renderers, architecture rules.
- `npm run check` (import-graph check) and `npm run verify` (test + check + build).
- `README.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/LICENSE-DECISION.md`, `LICENSE` (decision pending),
  `.editorconfig`, `.prettierrc.json`, `.gitignore`, `.env.example`.
- `VITE_SITE_URL` to configure the public URL.

### Behavior notes
- **Fixed** — mystery-material mode rejected honest readings of the diamond at small angles; it now uses the same ±1.5°
  tolerance as the water mode (ADR-13).
- **Aligned** — the problems section parsed answers with a looser parser than the experiment; all inputs now use the same
  strict decimal parsing (`"14.9abc"` is no longer accepted).
- **Aligned** — leaving fullscreen with Esc while presenting now also scrolls back to the slide you were on.
- Progress saved in `localStorage` by earlier versions keeps working (legacy field names are still read).
- Apex-angle easing in the prism lab settles at a 0.03° threshold instead of 0.004° (visually identical).
- Chunk-size warning limit raised to 650 kB for the lazy Three.js chunk.

---

## Earlier iterations (before 2.0.0)

### Cambios v8.1 (según la auditoría)
- Menú: la lista desplegable aplica hasta 1240 px (antes 1000, y entre 1001 y 1240 se veían burger y lista a la vez). Lista con scroll propio en pantallas bajas.
- Laboratorio del prisma en celular: colores en una fila deslizable (el bloque pegajoso ocupa menos). El scroll táctil solo se bloquea al tocar un asa (láser, aro o prisma).
- Simulador en celular: solo se apunta tocando cerca del láser; el resto del lienzo deja deslizar la página.
- Barra de pantalla completa/exposición: solo iconos en pantallas medianas, oculta en celular; sin botón de pantalla completa si el navegador no la soporta (iPhone).
- Modo exposición: las flechas ya no hacen doble acción en pestañas, lienzos y deslizadores.
- Portada: el haz entra subiendo (≈21°) con el prisma recto; el abanico conserva el último valor válido si hay reflexión interna. Escenario oscuro de modo claro corregido en móvil. Texto de ayuda táctil.
- Laboratorio virtual: "Material misterioso" con opciones bien separadas (agua, vidrio, diamante) y medida validada; entrada de texto estricta (punto o coma).
- Tabla del experimento: validación estricta y compacta en pantallas angostas.
- Newton: la nota "colores paralelos" solo aparece si de verdad lo son.
- Texto del problema 2 (0.7071 / 1.333 = 0.5305), Newton en Woolsthorpe, código muerto y README (sin Fresnel).
- Sin "Transition was skipped"; Hero3D ya no se reconstruye al cambiar de tema.
- Objetivos táctiles de 44 px en pantallas táctiles.
## Pendiente
R9 (QR más grande en exposición), R13/R14 (casos extremos de diamante y placa), R17 (ARIA de pestañas), R21 (pausar el simulador fuera de pantalla), R20 (limpieza de CSS), build.sh.

# Cambios v8.2
- Ideas clave: los ángulos ahora se marcan con una cuña y un arco de circunferencia, con su valor (θᵢ = θᵣ = 45°, θ₁ = 50° → θ₂ ≈ 35° en agua, θc ≈ 49°), marcas de igualdad en la reflexión y flechas que indican el sentido de la luz.
- Historia en celular: línea de tiempo vertical que se va revelando al hacer scroll (punto, línea que se llena y tarjeta). En escritorio sigue la línea horizontal con pestañas.
- Portada: vidrio con reflejo iridiscente sutil, destellos en la entrada y salida de la luz, resplandor bajo el prisma y balanceo suave que deja ver su volumen. En celular el prisma ocupa su propia franja debajo del QR.

# Cambios v8.3
- Ángulos: la cuña volvía opaca por la animación (ahora es translúcida), arcos más grandes, solo el símbolo (θᵢ, θᵣ, θ₁, θ₂, θc) junto al arco y el valor en un resumen aparte.
- Historia: empieza en Euclides (Alejandría, ~300 a. C.) y sigue en orden cronológico.
- Integrantes en celular: dos columnas (el último, centrado).
- Modo exposición: cada sección ocupa la pantalla con espacio reservado para la barra; barra compacta y centrada con anterior/siguiente, puntos, cronómetro y botón "Salir"; sin botones repetidos; la dirección del QR ya no se parte.

# Cambios v8.4
- Modo exposición rehecho como diapositivas: se muestra UNA sección a la vez a pantalla completa, centrada verticalmente y con espacio reservado abajo para la barra. Ya no hay huecos entre secciones. Si una sección es algo más alta que la pantalla se reduce un poco para que quepa; si es mucho más alta, hace scroll dentro de la diapositiva.
- Barra limpia: pastilla translúcida con anterior/siguiente, número y nombre, puntos de progreso pequeños, cronómetro y salir. Esc y P siguen funcionando; al salir vuelves a la misma sección.
- El laboratorio del prisma escucha el scroll de cualquier contenedor (necesario dentro de las diapositivas).

# Cambios v8.5
- Botón de presentación: las opciones "Pantalla completa" y "Modo exposición" ahora se esconden tras un solo botón redondo (abajo a la izquierda) que las despliega; se cierra al elegir, al tocar fuera o con Esc.
- Nuevo orden de la página: Inicio → Integrantes → Historia → Contenido → Prisma → Aplicaciones → Experimento → Simulador → Problemas → Conclusiones → Referencias (menú, pie de página y modo exposición siguen el mismo orden).
- Datos del curso en `COURSE` (src/data.js): 5to UNI · Física · Semana 36 · IV Bimestre · Reflexión y Refracción, visibles en la portada, el pie de página y el título de la pestaña.
- Modo exposición: el indicador usa el nombre corto de la sección (ya no se corta).

# Cambios v9
- Modo exposición: texto "n/N Sección" centrado con el resto de la barra (antes quedaba más arriba).
- Simulador en exposición: diseño compacto que cabe en pantallas bajas sin encogerse con zoom (Present.jsx lo excluye del zoom).
- Conclusiones: 4 tarjetas con diagrama, fórmula y una franja con la idea final (CONCL_META / CONCL_KEY en data.js).
- Pie de página: etiquetas del curso en fila (sin desenfoque ni solapes).
- Láser y haz unificados con el diseño del Simulador: src/laser.js (canvas) y components/Laser.jsx (SVG), usados en Simulador, Prisma y Laboratorio virtual.

## Rendimiento (optimización)
- Canvas del simulador y del laboratorio del prisma: capas estáticas en canvas fuera de pantalla; cada cuadro solo redibuja ondas, ondulaciones y el aro del láser.
- Bucles de animación pausados fuera de pantalla; 30 fps y resolución 1.5× en pantallas táctiles.
- Hero 3D: arranca tras el primer pintado, calidad ligera en móvil (sin MSAA, vidrio simplificado, menos polvo) y bajada automática de resolución si los cuadros tardan.
- `Reveal` sin componentes `motion`: CSS + un único IntersectionObserver.
- Sin `backdrop-filter` en táctil, sin PointerGlow en táctil, animaciones SVG pausadas fuera de vista.
- Versión de un solo archivo: `npx vite build -c vite.single.config.js` (requiere `vite-plugin-singlefile`).
