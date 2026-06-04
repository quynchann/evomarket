import { useLayoutEffect } from 'react'

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

export function stopMindarScene(container) {
  if (!container) return

  container.querySelectorAll('video').forEach((video) => {
    const stream = video.srcObject
    if (stream && typeof stream.getTracks === 'function') {
      stream.getTracks().forEach((track) => track.stop())
    }
    video.srcObject = null
  })

  const scene = container.querySelector('a-scene')
  const mindarSystem = scene?.systems?.['mindar-face-system']
  if (mindarSystem?.stop) {
    try {
      mindarSystem.stop()
    } catch {
      /* ignore */
    }
  }
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
