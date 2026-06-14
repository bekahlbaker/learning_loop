'use client'

import Button from '@/src/components/buttons/Button'
import en from '@/src/messages/en.json'

export interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  disabled?: boolean
  error?: string
}

function formatPhoneNumber(digits: string): string {
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

function extractDigits(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

function toE164(digits: string): string {
  return `+1${digits}`
}

export default function PhoneInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  error,
}: PhoneInputProps) {
  const digits = extractDigits(value)
  const isValid = digits.length === 10

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const newDigits = extractDigits(raw)
    onChange(formatPhoneNumber(newDigits))
  }

  const handleSubmit = () => {
    if (isValid) onSubmit(toE164(extractDigits(value)))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="phone-input" className="sr-only">
        Phone number
      </label>
      <div className="flex items-center gap-2">
        <input
          id="phone-input"
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="(555) 555-5555"
          disabled={disabled}
          autoFocus
          aria-invalid={!!error}
          aria-describedby={error ? 'phone-error' : undefined}
          className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button onClick={handleSubmit} disabled={disabled || !isValid} size="default">
          {en.onboarding.inputs.send}
        </Button>
      </div>
      {error && (
        <p id="phone-error" role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
