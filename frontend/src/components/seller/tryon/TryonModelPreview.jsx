import { useEffect, useMemo, useState } from 'react'
import { Loader2, RotateCcw, Save } from 'lucide-react'
import {
  getAnchorsForType,
  getDefaultConfigForType,
  normalizeVector3,
  TRYON_TYPE_META,
} from './tryonConfig'
import { TryonSlider } from './TryonSlider'
import FaceTryonScene from '../../tryon/FaceTryonScene.jsx'

const axes = ['x', 'y', 'z']

/**
 * @param {{
 *   modelUrl: string,
 *   config: ReturnType<typeof getDefaultConfigForType>,
 *   onConfigChange: (updater: Function) => void,
 *   productId?: number|null,
 *   onSave?: () => Promise<void>,
 *   saveDisabled?: boolean,
 * }} props
 */
export default function TryonModelPreview({
  modelUrl,
  config,
  onConfigChange,
  productId = null,
  onSave,
  saveDisabled = false,
}) {
  const [saveStatus, setSaveStatus] = useState('idle')
  const [controlsOpen, setControlsOpen] = useState(true)

  const tryOnType = config.type || 'glasses'
  const anchors = config.anchors ?? getAnchorsForType(tryOnType)
  const typeLabel = TRYON_TYPE_META[tryOnType]?.label ?? tryOnType

  useEffect(() => {
    const blockSceneNavigationKeys = (event) => {
      if (
        !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
          event.key,
        )
      ) {
        return
      }
      const target = event.target
      if (
        target instanceof HTMLElement &&
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
      ) {
        return
      }
      event.preventDefault()
    }

    window.addEventListener('keydown', blockSceneNavigationKeys, {
      passive: false,
    })
    return () => {
      window.removeEventListener('keydown', blockSceneNavigationKeys)
    }
  }, [])

  const previewItems = useMemo(
    () =>
      anchors.map((anchorIndex) => ({
        anchorIndex,
        modelUrl,
        position: normalizeVector3(config.position),
        rotation: normalizeVector3(config.rotation),
        scale: normalizeVector3(config.scale, { x: 1, y: 1, z: 1 }),
      })),
    [anchors, modelUrl, config.position, config.rotation, config.scale],
  )

  const updateVectorAxis = (field, axis, value) => {
    onConfigChange((prev) => ({
      ...prev,
      [field]: { ...prev[field], [axis]: value },
    }))
  }

  const handleReset = () => {
    onConfigChange(() => getDefaultConfigForType(tryOnType))
  }

  const handleSave = async () => {
    if (!onSave) return
    setSaveStatus('saving')
    try {
      await onSave()
      setSaveStatus('saved')
      window.setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error(error)
      setSaveStatus('error')
      window.setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const saveLabel =
    saveStatus === 'saving'
      ? 'Đang lưu...'
      : saveStatus === 'saved'
        ? 'Đã lưu'
        : saveStatus === 'error'
          ? 'Lỗi lưu'
          : 'Lưu cấu hình AR'

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border-2 border-purple-200">
        <FaceTryonScene
          items={previewItems}
          ratio16x9
          className="rounded-xl"
          loadErrorMessage="Tải model quá lâu. Thử refresh trang hoặc upload lại file .glb."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setControlsOpen((p) => !p)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          {controlsOpen ? 'Thu gọn điều khiển' : 'Mở điều khiển'}
        </button>
      </div>

      {controlsOpen ? (
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-purple-100 bg-white/90 p-4">
          <p className="text-xs text-slate-600">
            Loại{' '}
            <span className="font-semibold text-slate-800">{typeLabel}</span> —
            anchor:{' '}
            <span className="font-mono text-purple-700">
              {anchors.join(', ')}
            </span>
          </p>

          {['rotation', 'position', 'scale'].map((field) => (
            <div
              key={field}
              className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <h4 className="mb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {field === 'rotation'
                  ? 'Rotation'
                  : field === 'position'
                    ? 'Position'
                    : 'Scale'}
              </h4>
              <div className="space-y-2">
                {axes.map((axis) => (
                  <TryonSlider
                    key={`${field}-${axis}`}
                    label={axis.toUpperCase()}
                    min={
                      field === 'rotation'
                        ? -180
                        : field === 'position'
                          ? -2
                          : 0.01
                    }
                    max={
                      field === 'rotation' ? 180 : field === 'position' ? 2 : 20
                    }
                    step={
                      field === 'rotation'
                        ? 0.1
                        : field === 'position'
                          ? 0.01
                          : 0.005
                    }
                    value={config[field][axis]}
                    onChange={(value) => updateVectorAxis(field, axis, value)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-purple-200 bg-white px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50">
              <RotateCcw className="h-4 w-4" />
              Đặt lại
            </button>
            {onSave ? (
              <button
                type="button"
                onClick={handleSave}
                disabled={saveDisabled || saveStatus === 'saving' || !productId}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
                {saveStatus === 'saving' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saveLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
