import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { clamp } from '../../domain/numbers.js'
import { wavelengthToCss } from '../../domain/spectrum.js'
import { BEAM_DIRECTION, FAN_WAVELENGTHS, HERO_PRISM_VERTICES, fanAngles, traceHeroBeam } from './heroBeam.js'

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

  const streakOut = createStreakTexture('out'), streakIn = createStreakTexture('in'), glowTexture = createGlowTexture()
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
  const fan = FAN_WAVELENGTHS.map((nm) => { const color = new THREE.Color(wavelengthToCss(nm)); return { inside: addStreak(streakOut, color, 0.5), core: addStreak(streakOut, color, 1), glow: addStreak(streakOut, color, 0.35) } })
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

    const angles = exit ? fanAngles(exit.direction) : []
    fan.forEach(({ inside, core, glow }, i) => {
      if (!exit) { inside.visible = core.visible = glow.visible = false; return }
      const end = [exit.to[0] + Math.cos(angles[i]) * FAN_RAY_LENGTH, exit.to[1] + Math.sin(angles[i]) * FAN_RAY_LENGTH]
      placeSegment(inside, exit.from, exit.to, 0.06)
      placeSegment(core, exit.to, end, 0.11)
      placeSegment(glow, exit.to, end, 0.22)
    })

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
      streakOut.dispose(); streakIn.dispose(); glowTexture.dispose(); environment.dispose(); renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
