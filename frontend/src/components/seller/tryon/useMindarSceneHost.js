import { useLayoutEffect } from 'react'

function stopVideoElement(video) {
  if (!video) return

  const stream = video.srcObject
  if (stream && typeof stream.getTracks === 'function') {
    stream.getTracks().forEach((track) => {
      try {
        track.stop()
      } catch {
        /* ignore */
      }
    })
  }

  try {
    video.pause()
  } catch {
    /* ignore */
  }

  video.srcObject = null
  video.removeAttribute('src')
  try {
    video.load()
  } catch {
    /* ignore */
  }
}

function isLiveCameraVideo(video) {
  const stream = video?.srcObject
  if (!(stream instanceof MediaStream)) return false
  return stream.getTracks().some((track) => track.readyState === 'live')
}

/**
 * Dừng mọi stream camera còn active trên trang (fallback khi MindAR không gắn video trong container).
 */
export function releaseActiveCameraStreams() {
  document.querySelectorAll('video').forEach((video) => {
    if (isLiveCameraVideo(video)) {
      stopVideoElement(video)
    }
  })
}

/**
 * Chỉ đồng bộ kích thước scene với container — không đổi camera.aspect (MindAR tự quản lý).
 */
export function useMindarSceneHost(containerRef, deps = []) {
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId = 0

    const resizeScene = () => {
      const scene = container.querySelector('a-scene')
      if (!scene) return

      const w = container.clientWidth
      const h = container.clientHeight
      if (w < 2 || h < 2) return

      scene.style.width = `${w}px`
      scene.style.height = `${h}px`

      if (scene.renderer) {
        scene.renderer.setClearColor(0, 0, 0, 0)
        scene.renderer.setSize(w, h, false)
      }

      const video = container.querySelector('video')
      if (video) {
        video.style.width = `${w}px`
        video.style.height = `${h}px`
        video.style.left = '0'
        video.style.top = '0'
        video.style.objectFit = 'fill'
      }
    }

    const scheduleResize = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(resizeScene)
    }

    scheduleResize()

    const ro = new ResizeObserver(scheduleResize)
    ro.observe(container)

    const scene = container.querySelector('a-scene')
    const onLoaded = () => scheduleResize()

    if (scene) {
      scene.addEventListener('loaded', onLoaded)
      scene.addEventListener('arReady', onLoaded)
      if (scene.hasLoaded) onLoaded()
    }

    const t1 = window.setTimeout(scheduleResize, 150)
    const t2 = window.setTimeout(scheduleResize, 600)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      if (scene) {
        scene.removeEventListener('loaded', onLoaded)
        scene.removeEventListener('arReady', onLoaded)
      }
    }
  }, deps)
}

function stopMindarSystem(mindarSystem) {
  if (!mindarSystem) return

  try {
    mindarSystem.pause?.()
    mindarSystem.stop?.()
  } catch {
    /* ignore */
  }
}

export function stopMindarScene(container, mindarSystemOverride = null) {
  const scene = container?.querySelector?.('a-scene') ?? null
  const mindarSystem =
    mindarSystemOverride ?? scene?.systems?.['mindar-face-system'] ?? null

  stopMindarSystem(mindarSystem)

  if (!scene) {
    document.querySelectorAll('a-scene[mindar-face]').forEach((orphanScene) => {
      stopMindarSystem(orphanScene.systems?.['mindar-face-system'])
    })
  }

  if (container) {
    container.querySelectorAll('video').forEach(stopVideoElement)
  }

  if (scene) {
    scene.querySelectorAll('video').forEach(stopVideoElement)
  }

  document.querySelectorAll('video').forEach((video) => {
    if (!isLiveCameraVideo(video)) return

    const inTryonTree =
      (container && container.contains(video)) ||
      (scene && scene.contains(video)) ||
      video.closest('.tryon-scene-host') ||
      video.closest('a-scene')

    if (inTryonTree) {
      stopVideoElement(video)
    }
  })

  if (scene?.renderer) {
    try {
      scene.renderer.setAnimationLoop?.(null)
      scene.renderer.dispose?.()
    } catch {
      /* ignore */
    }
  }

  if (scene && typeof scene.destroy === 'function') {
    try {
      scene.destroy()
    } catch {
      /* ignore */
    }
  }

  releaseActiveCameraStreams()
}

export function waitForArLibraries() {
  return new Promise((resolve) => {
    const check = () => {
      if (typeof window !== 'undefined' && window.AFRAME) {
        resolve(true)
        return
      }
      requestAnimationFrame(check)
    }
    check()
  })
}
