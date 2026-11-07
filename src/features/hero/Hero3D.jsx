import { useEffect, useRef } from 'react'
import { createHeroScene } from './heroScene.js'

/** React wrapper around the Three.js hero scene. Calls `onFail` when WebGL is unavailable so the 2D fallback can take over. */
export default function Hero3D({ theme, reduceMotion, onFail }) {
  const host = useRef(), failHandler = useRef(onFail)
  failHandler.current = onFail   // the scene must not be rebuilt just because the parent re-rendered
  useEffect(() => {
    const scene = createHeroScene({ host: host.current, reduceMotion })
    if (!scene) { failHandler.current?.(); return }
    return () => scene.dispose()
  }, [reduceMotion])
  return <div ref={host} className={'hero3d' + (theme === 'dark' ? '' : ' stage')} aria-hidden="true" />
}
