'use client'

import { useState, useRef } from 'react'
import Button from '@/app/components/buttons/Button'

export interface HintRevealProps {
  hint: string
  onReveal?: () => void
  disabled?: boolean
}

export default function HintReveal({ hint, onReveal, disabled = false }: HintRevealProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasRevealed = useRef(false)

  const handleToggle = () => {
    if (disabled) return
    const opening = !isOpen
    setIsOpen(opening)
    if (opening && !hasRevealed.current) {
      hasRevealed.current = true
      onReveal?.()
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="ghost"
        size="small"
        onClick={handleToggle}
        disabled={disabled}
        className="self-start text-xs text-gray-500"
      >
        {isOpen ? 'Hide hint' : 'Show hint'}
      </Button>
      {isOpen && !disabled && (
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs text-gray-600 italic">
          {hint}
        </div>
      )}
    </div>
  )
}
