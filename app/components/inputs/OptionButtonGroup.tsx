'use client'

import { useState } from 'react'
import OptionButton from '@/src/components/inputs/OptionButton'

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
  selected: controlledSelected,
  disabled: controlledDisabled = false,
  ariaLabel = 'Options',
}: OptionButtonGroupProps) {
  const [internalSelected, setInternalSelected] = useState<string | undefined>(
    controlledSelected
  )
  const [isSubmitted, setIsSubmitted] = useState(false)

  const selected = controlledSelected ?? internalSelected
  const disabled = controlledDisabled || isSubmitted
  const isOdd = options.length % 2 !== 0

  const handleSelect = (value: string) => {
    if (disabled) return
    setInternalSelected(value)
    setIsSubmitted(true)
    onSelect(value)
  }

  return (
    <div
      role="group"
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
              onSelect={handleSelect}
              selected={selected === opt.value}
              disabled={disabled && selected !== opt.value}
            />
          </div>
        )
      })}
    </div>
  )
}
