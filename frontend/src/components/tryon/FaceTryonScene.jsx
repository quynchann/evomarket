import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  HEAD_OCCLUDER_URL,
  formatVector,
  normalizeVector3,
} from '../seller/tryon/tryonConfig'
import {
  useMindarSceneHost,
  waitForArLibraries,
  stopMindarScene,
} from '../seller/tryon/useMindarSceneHost'
import '../seller/tryon/tryonScene.css'

const HeadOccluder = memo(function HeadOccluder() {
  return (
    <a-entity mindar-face-target="anchorIndex: 168">
      <a-gltf-model
        mindar-face-occluder="true"
        position="0 -0.3 0.15"
        rotation="0 0 0"
        scale="0.065 0.065 0.065"
        src="#headModel"
      />
    </a-entity>
  )
})

/**
 * @param {{
 *   items: Array<{
 *     anchorIndex: number,
 *     modelUrl: string,
 *     position: { x: number, y: number, z: number },
 *     rotation: { x: number, y: number, z: number },
 *     scale: { x: number, y: number, z: number },
 *   }>,
 *   fullscreen?: boolean,
 *   ratio16x9?: boolean,
 *   className?: string,
 *   modelLoadTimeoutMs?: number,
 *   loadErrorMessage?: string,
 * }} props
 */
export default function FaceTryonScene({
  items,
  fullscreen = false,
  ratio16x9 = false,
  className = '',
  modelLoadTimeoutMs = 90000,
  loadErrorMessage = 'Không thể khởi động AR. Vui lòng thử lại.',
}) {
  const hostRef = useRef(null)
  const sceneReadyRef = useRef(false)
  const [libsReady, setLibsReady] = useState(false)
  const [sceneVisible, setSceneVisible] = useState(false)
  const [loadError, setLoadError] = useState(null)

  const sceneKey = items.map((i) => `${i.anchorIndex}-${i.modelUrl}`).join('|')

  const transformKey = items
    .map(
      (i) =>
        `${i.anchorIndex}:${formatVector(i.position)}:${formatVector(i.rotation)}:${formatVector(i.scale)}`,
    )
    .join('|')

  useEffect(() => {
    let cancelled = false
    waitForArLibraries().then(() => {
      if (!cancelled) setLibsReady(true)
    })
    return () => {
      cancelled = true
      stopMindarScene(hostRef.current)
    }
  }, [])

  useMindarSceneHost(hostRef, [libsReady, sceneKey, ratio16x9, fullscreen])

  useLayoutEffect(() => {
    if (!sceneVisible || !hostRef.current) return
    const container = hostRef.current

    items.forEach((item) => {
      const el = container.querySelector(
        `[data-tryon-model][data-anchor-index="${item.anchorIndex}"]`,
      )
      if (!el) return
      el.setAttribute('position', formatVector(item.position))
      el.setAttribute('rotation', formatVector(item.rotation))
      el.setAttribute('scale', formatVector(item.scale))
    })
  }, [items, sceneVisible, transformKey])

  useEffect(() => {
    sceneReadyRef.current = false
    setSceneVisible(false)
    setLoadError(null)
  }, [sceneKey])

  useEffect(() => {
    if (!libsReady || !hostRef.current) return

    const container = hostRef.current
    const scene = container.querySelector('a-scene')
    if (!scene) return

    const onSceneLoaded = () => {
      sceneReadyRef.current = true
      setSceneVisible(true)
      setLoadError(null)
      requestAnimationFrame(() => {
        if (scene.renderer) {
          scene.renderer.setClearColor(0, 0, 0, 0)
        }
        container.querySelectorAll('video').forEach((video) => {
          video.style.display = 'block'
          video.style.opacity = '1'
          video.setAttribute('playsinline', '')
          video.setAttribute('webkit-playsinline', '')
          video.muted = true
          video.playsInline = true
          const playPromise = video.play()
          if (playPromise?.catch) playPromise.catch(() => {})
        })
      })
    }

    const onModelError = () => {
      setLoadError('Không tải được model 3D từ máy chủ.')
    }

    const bindModelErrors = () => {
      container.querySelectorAll('[data-tryon-model]').forEach((el) => {
        el.addEventListener('model-error', onModelError)
      })
    }

    const onReady = () => {
      onSceneLoaded()
      bindModelErrors()
    }

    scene.addEventListener('loaded', onReady)
    scene.addEventListener('arReady', onReady)
    scene.addEventListener('renderstart', onReady)
    if (scene.hasLoaded) onReady()

    const assetTimeout = window.setTimeout(() => {
      if (!sceneReadyRef.current) {
        setLoadError(loadErrorMessage)
      }
    }, modelLoadTimeoutMs)

    return () => {
      scene.removeEventListener('loaded', onReady)
      scene.removeEventListener('arReady', onReady)
      scene.removeEventListener('renderstart', onReady)
      container.querySelectorAll('[data-tryon-model]').forEach((el) => {
        el.removeEventListener('model-error', onModelError)
      })
      window.clearTimeout(assetTimeout)
    }
  }, [libsReady, sceneKey, loadErrorMessage, modelLoadTimeoutMs])

  const shellClass = [
    'tryon-scene-host',
    fullscreen && 'tryon-scene-host--fullscreen',
    ratio16x9 && 'tryon-scene-host--ratio-16-9',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const sceneContent = (
    <>
      {(!libsReady || !sceneVisible) && !loadError ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/80 text-white">
          <Loader2 className="h-10 w-10 animate-spin text-purple-300" />
          <p className="text-sm">
            {!libsReady ? 'Đang tải AR...' : 'Đang mở camera...'}
          </p>
        </div>
      ) : null}

      {loadError ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 p-6 text-center text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      {libsReady && items.length > 0 && items[0].modelUrl ? (
        <a-scene
          key={sceneKey}
          mindar-face="uiLoading: no; uiScanning: no; uiError: no"
          color-space="sRGB"
          renderer="alpha: true; antialias: true; colorManagement: true; physicallyCorrectLights: true; precision: mediump"
          vr-mode-ui="enabled: false"
          device-orientation-permission-ui="enabled: false"
          loading-screen="enabled: false"
        >
          <a-assets timeout="120000">
            <a-asset-item
              id="headModel"
              src={HEAD_OCCLUDER_URL}
              crossOrigin="anonymous"
            />
          </a-assets>

          <a-camera
            active="false"
            position="0 0 0"
            look-controls="enabled: false"
            wasd-controls="enabled: false"
          />

          <HeadOccluder />

          {items.map((item) => {
            const position = normalizeVector3(item.position)
            const rotation = normalizeVector3(item.rotation)
            const scale = normalizeVector3(item.scale, { x: 1, y: 1, z: 1 })

            return (
              <a-entity
                key={`tryon-${item.anchorIndex}-${item.modelUrl}`}
                mindar-face-target={`anchorIndex: ${item.anchorIndex}`}
              >
                <a-gltf-model
                  data-tryon-model
                  data-anchor-index={item.anchorIndex}
                  src={item.modelUrl}
                  crossorigin="anonymous"
                  position={formatVector(position)}
                  rotation={formatVector(rotation)}
                  scale={formatVector(scale)}
                />
              </a-entity>
            )
          })}
        </a-scene>
      ) : null}
    </>
  )

  return (
    <div ref={hostRef} className={shellClass}>
      {sceneContent}
    </div>
  )
}
