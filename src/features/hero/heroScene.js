import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { clamp } from '../../domain/numbers.js'
import { wavelengthToCss } from '../../domain/spectrum.js'
import { BEAM_DIRECTION, HERO_PRISM_VERTICES, WEDGE_SAMPLES, spectrumRays, traceHeroBeam, wedgeWavelength, wedgeWeight } from './heroBeam.js'

// Three.js scene of the hero: a glass prism, a white beam and a seven-color fan, with a light follow-the-pointer
// motion. `createHeroScene` owns everything it allocates and releases it in `dispose()`.

const POINTER_SMOOTHING = 0.06
const TIME_STEP = 0.012
const WIDE_BREAKPOINT = 900
const DUST_COUNT = 220
const DUST_COUNT_LITE = 90
// Quality tiers: touch devices start in "lite" (no MSAA, lower pixel ratio, simpler glass, 30 fps) and every device
// steps its pixel ratio down automatically if frames take too long.
const IS_LITE = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
const LITE_FRAME_MS = 1000 / 30
const SLOW_FRAME_MS = 26        // average frame time above this triggers a quality step down
const QUALITY_WINDOW = 40       // frames averaged before judging
const FAN_RAY_LENGTH = 16
const BEAM_FAR = 24

/** Soft horizontal "streak" texture; `direction` 'in' fades in along the ray, 'out' fades out. */
function createStreakTexture(direction) {
  const canvas = document.createElement('canvas')
  canvas.width = 128; canvas.height = 32
  const ctx = canvas.getContext('2d'), image = ctx.createImageData(128, 32)
  for (let y = 0; y < 32; y++) for (let x = 0; x < 128; x++) {
    const across = (y - 15.5) / 15.5, along = x / 127
    const alpha = Math.exp(-(across * across) * 5) * (direction === 'out' ? Math.pow(1 - along, 1.3) : Math.pow(along, 2.2))
    const i = (y * 128 + x) * 4
    image.data[i] = image.data[i + 1] = image.data[i + 2] = 255
    image.data[i + 3] = alpha * 255
  }
  ctx.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createGlowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d'), gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(0.25, 'rgba(255,255,255,.45)'); gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Returns null when WebGL is unavailable. */
function createRenderer(host) {
  let renderer
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !IS_LITE, powerPreference: IS_LITE ? 'default' : 'high-performance' }) } catch { return null }
  renderer.setClearColor(0, 0)
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, IS_LITE ? 1.25 : 1.75))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.domElement.className = 'hero-cv'
  host.appendChild(renderer.domElement)
  return renderer
}

/** Glass: no `transmission` (over a transparent canvas it looks like opaque plastic). Translucent + environment reflections + bright edges. */
function createGlassPrism() {
  const shape = new THREE.Shape()
  HERO_PRISM_VERTICES.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)))
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: IS_LITE ? 2 : 4 })
  geometry.translate(0, 0, -0.75)
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xbcd4ff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.24, envMapIntensity: 2.6, side: THREE.DoubleSide, depthWrite: false,
    // clearcoat + iridescence add two extra shader layers: nice on desktop GPUs, costly on phones
    ...(IS_LITE ? {} : { clearcoat: 1, clearcoatRoughness: 0.02, iridescence: 0.6, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 520] }),
  })
  const prism = new THREE.Mesh(geometry, material)
  prism.renderOrder = 1
  prism.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 25), new THREE.LineBasicMaterial({ color: 0xdbe8ff, transparent: true, opacity: 0.95 })))
  return prism
}

/**
 * A filled band of light: one triangle strip across `WEDGE_SAMPLES` colors. Near and far vertices of each color are
 * updated every frame; the fragment shader fades the band along its length and softens its two edges, so the spectrum
 * reads as one continuous beam instead of seven lines.
 */
function createWedge() {
  const vertexCount = WEDGE_SAMPLES * 2
  const positions = new Float32Array(vertexCount * 3), colors = new Float32Array(vertexCount * 3), alphas = new Float32Array(vertexCount), across = new Float32Array(vertexCount)
  const index = []
  for (let j = 0; j < WEDGE_SAMPLES; j++) {
    const color = new THREE.Color(wavelengthToCss(wedgeWavelength(j))), weight = wedgeWeight(j)
    for (let k = 0; k < 2; k++) { colors.set([color.r * weight, color.g * weight, color.b * weight], (j * 2 + k) * 3); across[j * 2 + k] = j / (WEDGE_SAMPLES - 1) }
    if (j < WEDGE_SAMPLES - 1) index.push(j * 2, j * 2 + 1, j * 2 + 2, j * 2 + 2, j * 2 + 1, j * 2 + 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
  geometry.setAttribute('aAcross', new THREE.BufferAttribute(across, 1))
  geometry.setIndex(index)
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'attribute vec3 aColor; attribute float aAlpha; attribute float aAcross; varying vec3 vColor; varying float vAlpha; varying float vAcross;\n'
      + 'void main() { vColor = aColor; vAlpha = aAlpha; vAcross = aAcross; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vColor; varying float vAlpha; varying float vAcross;\n'
      + 'void main() { float edge = smoothstep(0.0, 0.2, vAcross) * smoothstep(1.0, 0.8, vAcross); gl_FragColor = vec4(vColor, vAlpha * edge);\n'
      + '#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false
  mesh.renderOrder = 2
  /** `near[j]` and `far[j]` are [x, y] points; alpha goes linearly from `nearAlpha` to `farAlpha` along each color. */
  const update = (near, far, nearAlpha, farAlpha) => {
    for (let j = 0; j < WEDGE_SAMPLES; j++) {
      positions.set([near[j][0], near[j][1], 0.01, far[j][0], far[j][1], 0.01], j * 6)
      alphas[j * 2] = nearAlpha; alphas[j * 2 + 1] = farAlpha
    }
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.aAlpha.needsUpdate = true
  }
  return { mesh, update }
}

function createDust(count) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) { positions[i * 3] = (Math.random() - 0.5) * 18; positions[i * 3 + 1] = (Math.random() - 0.5) * 10; positions[i * 3 + 2] = (Math.random() - 0.5) * 6 }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  return new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.045, color: 0xffffff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }))
}

function driftDust(dust, time) {
  const positions = dust.geometry.attributes.position, count = positions.count
  for (let i = 0; i < count; i++) {
    positions.array[i * 3 + 1] += 0.004
    positions.array[i * 3] += Math.sin(time + i) * 0.0015
    if (positions.array[i * 3 + 1] > 5) positions.array[i * 3 + 1] = -5
  }
  positions.needsUpdate = true
}

/**
 * Builds and starts the hero scene inside `host`. Returns `{ dispose }`, or null when WebGL is unavailable.
 * The scene is always dark; in the light theme CSS draws a dark "stage" behind it (.hero3d.stage).
 */
export function createHeroScene({ host, reduceMotion }) {
  const renderer = createRenderer(host)
  if (!renderer) return null

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
  camera.position.z = 12
  const environment = new THREE.PMREMGenerator(renderer)
  scene.environment = environment.fromScene(new RoomEnvironment(), 0.04).texture
  const key = new THREE.DirectionalLight(0xffffff, 2.2)
  key.position.set(-4, 5, 6)
  scene.add(key)

  const group = new THREE.Group()   // prism, beam and flares share the camera tilt
  group.rotation.set(0.2, -0.3, 0)
  scene.add(group)
  const prism = createGlassPrism()
  group.add(prism)

  const streakIn = createStreakTexture('in'), glowTexture = createGlowTexture()
  const addStreak = (texture, color, opacity) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texture, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }))
    mesh.renderOrder = 2
    group.add(mesh)
    return mesh
  }
  const addGlow = (color, opacity) => {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }))
    sprite.renderOrder = 3
    group.add(sprite)
    return sprite
  }
  const entryFlare = addGlow(0xffffff, 0.9), exitFlare = addGlow(0xfff2d6, 0.7), floorGlow = addGlow(0x6c7bff, 0.38)
  floorGlow.scale.set(6.2, 1.5, 1)
  floorGlow.position.set(0, -1.05, 0)
  const beamGlow = addStreak(streakIn, 0xffffff, 0.35), beam = addStreak(streakIn, 0xffffff, 1)
  const insideWedge = createWedge(), outsideWedge = createWedge(), glowWedge = createWedge()   // colors inside the glass (just starting to part) and after the exit face
  group.add(insideWedge.mesh, outsideWedge.mesh, glowWedge.mesh)
  const dust = createDust(IS_LITE ? DUST_COUNT_LITE : DUST_COUNT)
  scene.add(dust)

  /** Places a streak mesh along the segment a→b with the given thickness. */
  const placeSegment = (mesh, a, b, thickness) => {
    mesh.visible = true
    mesh.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.01)
    mesh.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0])
    mesh.scale.set(Math.hypot(b[0] - a[0], b[1] - a[1]), thickness, 1)
  }

  const pointer = { x: 0.62, y: 0.5, targetX: 0.62, targetY: 0.5 }
  let time = reduceMotion ? 0.6 : 0, frame = 0, onScreen = true, wide = true
  let lastValidExit = null   // keeps the last clean fan when the beam momentarily suffers internal reflection
  let lastPaint = 0, frameSum = 0, frameCount = 0, ratio = renderer.getPixelRatio()

  /** Averages frame times and lowers the pixel ratio (never below 1) when the device cannot keep up. */
  const adaptQuality = (now) => {
    if (lastPaint) { frameSum += now - lastPaint; frameCount++ }
    lastPaint = now
    if (frameCount < QUALITY_WINDOW) return
    const average = frameSum / frameCount
    frameSum = frameCount = 0
    if (average > SLOW_FRAME_MS * (IS_LITE ? 1.5 : 1) && ratio > 1) {
      ratio = Math.max(1, ratio - 0.25)
      renderer.setPixelRatio(ratio)
      renderer.setSize(host.clientWidth || 1, host.clientHeight || 1, false)
    }
  }

  const renderFrame = (now = performance.now()) => {
    frame = 0
    if (IS_LITE && !reduceMotion && lastPaint && now - lastPaint < LITE_FRAME_MS - 2) { frame = requestAnimationFrame(renderFrame); return }
    if (!reduceMotion) adaptQuality(now)
    pointer.x += (pointer.targetX - pointer.x) * POINTER_SMOOTHING
    pointer.y += (pointer.targetY - pointer.y) * POINTER_SMOOTHING
    const rotation = (pointer.x - 0.5) * 0.5 + Math.sin(time) * 0.04
    const entryHeight = clamp(-0.1 + (0.5 - pointer.y), -0.5, 0.8)
    prism.rotation.z = rotation
    group.rotation.y = -0.3 + (pointer.x - 0.5) * 0.3 + Math.sin(time * 0.6) * 0.1
    group.rotation.x = 0.2 + (pointer.y - 0.5) * 0.14

    const traced = traceHeroBeam(rotation, entryHeight)
    if (traced.exit) lastValidExit = traced.exit
    const exit = lastValidExit
    const beamEnd = traced.entry || [traced.origin[0] + BEAM_DIRECTION[0] * BEAM_FAR, traced.origin[1] + BEAM_DIRECTION[1] * BEAM_FAR]
    placeSegment(beamGlow, traced.origin, beamEnd, 0.5)
    placeSegment(beam, traced.origin, beamEnd, 0.09)

    entryFlare.visible = Boolean(traced.entry)
    if (traced.entry) { entryFlare.position.set(traced.entry[0], traced.entry[1], 0.05); entryFlare.scale.setScalar(0.85 + Math.sin(time * 3) * 0.08) }
    exitFlare.visible = Boolean(exit)
    if (exit) { exitFlare.position.set(exit.to[0], exit.to[1], 0.05); exitFlare.scale.setScalar(1.25 + Math.sin(time * 2.2) * 0.1) }

    insideWedge.mesh.visible = outsideWedge.mesh.visible = glowWedge.mesh.visible = Boolean(exit)
    if (exit) {
      const rays = spectrumRays(exit, rotation)
      insideWedge.update(rays.map(() => exit.from), rays.map((ray) => ray.start), 0.2, 0.7)
      const reach = (list) => list.map((ray) => [ray.start[0] + Math.cos(ray.angle) * FAN_RAY_LENGTH, ray.start[1] + Math.sin(ray.angle) * FAN_RAY_LENGTH])
      outsideWedge.update(rays.map((ray) => ray.start), reach(rays), 0.85, 0)
      const halo = spectrumRays(exit, rotation, 1.45)   // a wider, faint copy: the soft bloom around the colors
      glowWedge.update(halo.map((ray) => ray.start), reach(halo), 0.3, 0)
    }

    driftDust(dust, time)
    group.position.set(wide ? 2.7 : 0.2, 0, 0)
    group.scale.setScalar(wide ? 0.85 : 0.8)
    renderer.render(scene, camera)
    if (!reduceMotion && onScreen) { time += IS_LITE ? TIME_STEP * 2 : TIME_STEP; frame = requestAnimationFrame(renderFrame) }
  }

  const resize = () => {
    const width = host.clientWidth || 1, height = host.clientHeight || 1
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    wide = width > WIDE_BREAKPOINT
    if (reduceMotion || !frame) renderFrame()
  }
  const onPointerMove = (event) => { pointer.targetX = event.clientX / innerWidth; pointer.targetY = event.clientY / innerHeight }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const visibilityObserver = new IntersectionObserver(([entry]) => {   // pause when scrolled out of view
    onScreen = entry.isIntersecting
    if (onScreen && !frame && !reduceMotion) { lastPaint = 0; frame = requestAnimationFrame(renderFrame) }
  })
  visibilityObserver.observe(host)
  if (!reduceMotion) addEventListener('pointermove', onPointerMove, { passive: true })
  renderer.domElement.addEventListener('webglcontextlost', (event) => event.preventDefault())
  resize()
  if (!reduceMotion && !frame) frame = requestAnimationFrame(renderFrame)

  return {
    dispose() {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      removeEventListener('pointermove', onPointerMove)
      scene.traverse((object) => { object.geometry?.dispose?.(); object.material?.dispose?.() })
      streakIn.dispose(); glowTexture.dispose(); environment.dispose(); renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
