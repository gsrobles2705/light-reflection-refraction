// Lightweight stand-in for `motion/react` (offline build): same API subset the project uses, built on the Web Animations API.
import { Children, createContext, createElement, forwardRef, isValidElement, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

const ReduceCtx = createContext(false), VariantCtx = createContext(null), PresenceCtx = createContext(null)
const DEFAULTS = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotate: 0, opacity: 1 }
const TRANSFORMS = ['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate']
const NAMED = { linear: 'linear', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out' }
const easing = (e) => Array.isArray(e) ? `cubic-bezier(${e.join(',')})` : NAMED[e] || 'cubic-bezier(.22,1,.36,1)'
const px = (v) => typeof v === 'number' ? v + 'px' : v

function toCss(v) {
  const out = {}, g = (k) => v[k] ?? DEFAULTS[k]
  if (TRANSFORMS.some((k) => k in v)) out.transform = `translate3d(${g('x')}px,${g('y')}px,0) scale(${g('scale')*g('scaleX')},${g('scale')*g('scaleY')}) rotate(${g('rotate')}deg)`
  if ('opacity' in v) out.opacity = v.opacity
  if ('height' in v) out.height = px(v.height)
  if ('width' in v) out.width = px(v.width)
  return out
}
const assign = (el, css) => { for (const k in css) el.style[k] = css[k] }

export class MotionValue {
  constructor(v) { this.v = v; this.subs = new Set() }
  get() { return this.v }
  set(v) { this.v = v; this.subs.forEach((f) => f(v)) }
  on(_, f) { this.subs.add(f); return () => this.subs.delete(f) }
}

const reducedQuery = () => matchMedia('(prefers-reduced-motion: reduce)')
export function useReducedMotion() {
  return useSyncExternalStore((cb) => { const q = reducedQuery(); q.addEventListener('change', cb); return () => q.removeEventListener('change', cb) }, () => reducedQuery().matches, () => false)
}
export function MotionConfig({ children, reducedMotion }) {
  const prefers = useReducedMotion()
  return <ReduceCtx.Provider value={reducedMotion === 'always' || (reducedMotion === 'user' && prefers)}>{children}</ReduceCtx.Provider>
}

const split = (def) => { if (!def) return [{}, {}]; const { transition, ...values } = def; return [values, transition || {}] }

/** Animates `el` from `cur` to `target`; resolves when finished. */
function animateTo(el, anim, cur, target, tr, reduce) {
  const keys = new Set([...Object.keys(cur), ...Object.keys(target)]), base = {}
  keys.forEach((k) => { if (k in DEFAULTS) base[k] = DEFAULTS[k] })
  const measure = () => el.getBoundingClientRect()
  const from = { ...base, ...cur }, to = { ...base, ...target }
  const running = anim.current
  if (running) { try { running.commitStyles() } catch {} running.cancel(); anim.current = null }
  const cs = getComputedStyle(el)
  for (const k of ['height', 'width']) {
    if (!(k in target) && !(k in cur)) continue
    if (from[k] == null || from[k] === 'auto' || running) from[k] = measure()[k]
    if (to[k] === 'auto') { const keep = el.style[k]; el.style[k] = 'auto'; to[k] = measure()[k]; el.style[k] = keep; to.__auto = k }
  }
  const finalCss = toCss(target), auto = to.__auto; delete to.__auto
  if (auto) finalCss[auto] = 'auto'
  const duration = reduce ? 0 : (tr.duration ?? 0.35)
  if (duration <= 0 && !tr.delay) { assign(el, finalCss); return Promise.resolve() }
  const fromCss = running ? { ...toCss(from), transform: cs.transform === 'none' ? toCss(from).transform : cs.transform, opacity: cs.opacity } : toCss(from)
  const keyframes = [fromCss, toCss(to)]
  const a = el.animate(keyframes, { duration: duration*1000, delay: (tr.delay || 0)*1000, easing: easing(tr.ease), fill: 'both' })
  anim.current = a
  return a.finished.then(() => { if (anim.current === a) { assign(el, finalCss); a.cancel(); anim.current = null } }).catch(() => {})
}

const shared = new Map()   // layoutId -> last rectangle of an unmounted element

function createMotion(tag) {
  return forwardRef(function Motion(props, forwardedRef) {
    const { initial, animate, exit, variants, custom, transition, style, layoutId, whileHover, whileTap, whileInView, viewport, layout, children, ...rest } = props
    const reduce = useContext(ReduceCtx), parent = useContext(VariantCtx), presence = useContext(PresenceCtx)
    const el = useRef(null), anim = useRef(null), cur = useRef({})
    const customValue = custom ?? parent?.custom
    const initialDef = initial !== undefined ? initial : parent?.initial
    const animateDef = animate !== undefined ? animate : parent?.animate
    const resolve = (def, c) => {
      if (def == null || def === false) return null
      if (typeof def !== 'string') return def
      const v = variants?.[def]
      return typeof v === 'function' ? v(c) : v ?? null
    }
    const animateTarget = resolve(animateDef, customValue)
    const [animateValues, animateTr] = split(animateTarget)
    const key = JSON.stringify(animateValues) + (typeof animateDef === 'string' ? animateDef : '')
    const mvEntries = Object.entries(style || {}).filter(([, v]) => v instanceof MotionValue)
    const staticStyle = Object.fromEntries(Object.entries(style || {}).filter(([, v]) => !(v instanceof MotionValue)))
    const setRefs = (node) => { el.current = node; if (typeof forwardedRef === 'function') forwardedRef(node); else if (forwardedRef) forwardedRef.current = node }

    const delayFor = (tr) => {
      const owner = el.current?.parentElement?.closest('[data-motion]')
      let extra = 0
      if (parent && owner) { const siblings = [...owner.querySelectorAll('[data-motion]')]; extra = (parent.delayChildren || 0) + siblings.indexOf(el.current)*(parent.stagger || 0) }
      return (tr.delay || 0) + extra
    }

    // Mount: set the initial values, then animate to the target; later: animate when the target changes
    const first = useRef(true)
    useLayoutEffect(() => {
      const node = el.current
      if (presence && !presence.present) return
      if (first.current) {
        first.current = false
        const skip = initialDef === false || presence?.skipInitial
        const [initialValues] = split(skip ? animateTarget : resolve(initialDef, customValue))
        cur.current = { ...initialValues }; assign(node, toCss(initialValues))
        if (skip) { cur.current = { ...animateValues }; assign(node, toCss(animateValues)); return }
      }
      if (!animateTarget) return
      const tr = { ...animateTr, ...(transition || {}) }
      tr.delay = delayFor(tr)
      animateTo(node, anim, cur.current, animateValues, tr, reduce).then(() => { cur.current = { ...cur.current, ...animateValues } })
    }, [key])

    // Exit (AnimatePresence)
    useLayoutEffect(() => {
      if (!presence || presence.present) return
      const [values, tr] = split(resolve(exit, presence.custom ?? customValue))
      if (!exit || !Object.keys(values).length) { presence.done(); return }
      animateTo(el.current, anim, cur.current, values, { ...tr, ...(transition || {}) }, reduce).then(presence.done)
    }, [presence?.present])

    // Motion values in `style`
    useEffect(() => {
      if (!mvEntries.length) return
      const apply = () => { const values = {}; mvEntries.forEach(([k, mv]) => { values[k] = mv.get() }); assign(el.current, toCss(values)) }
      apply()
      const offs = mvEntries.map(([, mv]) => mv.on('change', apply))
      return () => offs.forEach((off) => off())
    }, [mvEntries.map(([, mv]) => mv).join()])

    // Shared layout animation (FLIP) between elements that use the same layoutId
    useLayoutEffect(() => {
      if (!layoutId) return
      const node = el.current, previous = shared.get(layoutId)
      shared.delete(layoutId)
      if (previous && !reduce && performance.now() - previous.time < 800) {
        const next = node.getBoundingClientRect()
        if (next.width && next.height) node.animate([{ transformOrigin: '0 0', transform: `translate(${previous.left - next.left}px,${previous.top - next.top}px) scale(${previous.width/next.width},${previous.height/next.height})` }, { transformOrigin: '0 0', transform: 'none' }], { duration: 380, easing: easing([0.22, 1, 0.36, 1]) })
      }
      return () => { const r = node.getBoundingClientRect(); shared.set(layoutId, { left: r.left, top: r.top, width: r.width, height: r.height, time: performance.now() }) }
    }, [layoutId])

    const context = useMemo(() => ({
      initial: typeof initialDef === 'string' ? initialDef : undefined, animate: typeof animateDef === 'string' ? animateDef : undefined,
      custom: customValue, stagger: animateTr.staggerChildren || 0, delayChildren: animateTr.delayChildren || 0,
    }), [initialDef, animateDef, customValue, key])
    return createElement(tag, { ...rest, ref: setRefs, 'data-motion': '', style: staticStyle },
      <VariantCtx.Provider value={context}><PresenceCtx.Provider value={null}>{children}</PresenceCtx.Provider></VariantCtx.Provider>)
  })
}

const cache = {}
export const motion = new Proxy({}, { get: (_, tag) => (cache[tag] ||= createMotion(tag)) })

export function AnimatePresence({ children, mode = 'sync', initial = true, custom }) {
  const current = Children.toArray(children).filter(isValidElement)
  const previous = useRef([]), ghosts = useRef(new Map()), firstKeys = useRef(initial ? new Set() : new Set(current.map((c) => c.key)))
  const [, force] = useState(0)
  const keys = new Set(current.map((c) => c.key))
  previous.current.forEach((child, index) => { if (!keys.has(child.key) && !ghosts.current.has(child.key)) ghosts.current.set(child.key, { child, index }) })
  ghosts.current.forEach((_, k) => { if (keys.has(k)) ghosts.current.delete(k) })
  const done = (k) => { if (ghosts.current.delete(k)) force((n) => n + 1) }
  useEffect(() => { ghosts.current.forEach((_, k) => setTimeout(() => done(k), 1500)) })
  useLayoutEffect(() => { previous.current = current })

  let out = current.map((child) => ({ child, present: true }))
  const exiting = [...ghosts.current.entries()].sort((a, b) => a[1].index - b[1].index)
  if (mode === 'wait' && exiting.length) out = []
  exiting.forEach(([, { child, index }]) => out.splice(Math.min(index, out.length), 0, { child, present: false }))
  return out.map(({ child, present }) => (
    <PresenceCtx.Provider key={child.key} value={{ present, custom, skipInitial: firstKeys.current.has(child.key), done: () => done(child.key) }}>{child}</PresenceCtx.Provider>
  ))
}

export function useScroll() {
  const [values] = useState(() => ({ scrollY: new MotionValue(0), scrollYProgress: new MotionValue(0) }))
  useEffect(() => {
    const update = () => { const max = document.documentElement.scrollHeight - innerHeight; values.scrollY.set(scrollY); values.scrollYProgress.set(max > 0 ? Math.min(1, scrollY/max) : 0) }
    update(); addEventListener('scroll', update, { passive: true }); addEventListener('resize', update)
    return () => { removeEventListener('scroll', update); removeEventListener('resize', update) }
  }, [])
  return values
}
export function useTransform(source, input, output) {
  const latest = useRef({ input, output }); latest.current = { input, output }
  const map = (v) => { const { input: i, output: o } = latest.current; if (v <= i[0]) return o[0]; for (let n = 1; n < i.length; n++) if (v <= i[n]) return o[n - 1] + (o[n] - o[n - 1])*((v - i[n - 1])/(i[n] - i[n - 1])); return o[o.length - 1] }
  const derived = useMemo(() => new MotionValue(map(source.get())), [source])
  useEffect(() => source.on('change', (v) => derived.set(map(v))), [source])
  return derived
}
export function useSpring(source, { stiffness = 100, damping = 10 } = {}) {
  const spring = useMemo(() => new MotionValue(source.get()), [source])
  useEffect(() => {
    let target = source.get(), x = spring.get(), v = 0, frame = 0, last = 0
    const step = (now) => {
      const dt = Math.min(0.032, (now - last)/1000 || 0.016); last = now
      v += ((target - x)*stiffness - damping*v)*dt; x += v*dt
      if (Math.abs(target - x) < 0.0005 && Math.abs(v) < 0.0005) { x = target; frame = 0 } else frame = requestAnimationFrame(step)
      spring.set(x)
    }
    const off = source.on('change', (value) => { target = value; if (!frame) { last = performance.now(); frame = requestAnimationFrame(step) } })
    return () => { off(); cancelAnimationFrame(frame) }
  }, [source])
  return spring
}
