'use client'

import Button from '@/app/components/buttons/Button'

export interface SliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  formatLabel?: (value: number) => string
  disabled?: boolean
}

export default function Slider({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel,
  disabled = false,
}: SliderProps) {
  const fillPercent = ((value - min) / (max - min)) * 100
  const label = formatLabel ? formatLabel(value) : String(value)

  const decrement = () => onChange(Math.max(min, value - step))
  const increment = () => onChange(Math.min(max, value + step))

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-2xl font-semibold text-gray-800">{label}</p>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="small"
          onClick={decrement}
          disabled={disabled || value <= min}
          className="w-9 h-9 p-0 rounded-2xl shrink-0"
          aria-label="Decrease"
        >
          −
        </Button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          aria-label="Slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={label}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-gray-800 focus-ring"
          style={{
            background: `linear-gradient(to right, #1f2937 ${fillPercent}%, #e5e7eb ${fillPercent}%)`,
          }}
        />
        <Button
          variant="secondary"
          size="small"
          onClick={increment}
          disabled={disabled || value >= max}
          className="w-9 h-9 p-0 rounded-2xl shrink-0"
          aria-label="Increase"
        >
          +
        </Button>
      </div>
    </div>
  )
}
