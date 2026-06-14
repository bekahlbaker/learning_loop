'use client'

import { useRef } from 'react'
import Button from '@/app/components/buttons/Button'
import en from '@/app/messages/en.json'

export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  placeholder?: string
  label?: string
  disabled?: boolean
  autoFocus?: boolean
}

export default function TextInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  label,
  disabled = false,
  autoFocus = false,
}: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed) onSubmit(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor="text-input" className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          id="text-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className="w-full max-w-sm flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={label ?? 'Text input'}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          size="default"
        >
          {en.onboarding.inputs.send}
        </Button>
      </div>
    </div>
  )
}
