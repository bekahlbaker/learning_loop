'use client'

import OptionButton from '@/app/components/inputs/OptionButton'

export interface OptionButtonGroupProps {
  options: Array<{ label: string; value: string }>
  onSelect: (value: string) => void
  selected?: string
  disabled?: boolean
  ariaLabel?: string
}

export default function OptionButtonGroup({
  options,
  onSelect,
  selected,
  disabled = false,
  ariaLabel = 'Options',
}: OptionButtonGroupProps) {
  const isOdd = options.length % 2 !== 0

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {options.map((opt, i) => {
        const isLastAndOdd = isOdd && i === options.length - 1
        return (
          <div key={opt.value} className={isLastAndOdd ? 'sm:col-span-2' : undefined}>
            <OptionButton
              label={opt.label}
              value={opt.value}
              onSelect={onSelect}
              selected={selected === opt.value}
              disabled={disabled}
            />
          </div>
        )
      })}
    </div>
  )
}
