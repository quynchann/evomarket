import { formatControlValue } from './tryonConfig'

export function TryonSlider({ label, min, max, step, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-700">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-[11px] text-slate-500">
          {formatControlValue(value, step)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-purple-100 accent-purple-600"
      />
    </label>
  )
}
