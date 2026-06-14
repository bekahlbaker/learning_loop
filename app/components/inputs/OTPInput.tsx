'use client'

import { useRef, useState } from 'react'
import Button from '@/src/components/buttons/Button'

export interface OTPInputProps {
  length?: number
  onComplete: (code: string) => void
  onResend?: () => void
  disabled?: boolean
  error?: string
}

export default function OTPInput({
  length = 6,
  onComplete,
  onResend,
  disabled = false,
  error,
}: OTPInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    const code = next.join('')
    if (code.length === length && !next.includes('')) {
      onComplete(code)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = Array(length).fill('')
    pasted.split('').forEach((char, i) => {
      next[i] = char
    })
    setDigits(next)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[focusIndex]?.focus()
    if (pasted.length === length) {
      onComplete(pasted)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        role="group"
        aria-label="One-time passcode"
        className="flex gap-2"
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            disabled={disabled}
            autoFocus={i === 0}
            aria-label={`Digit ${i + 1} of ${length}`}
            aria-invalid={!!error}
            className="w-10 h-12 rounded-2xl border border-gray-300 bg-white text-center text-lg font-semibold text-gray-800 shadow-sm focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ))}
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      {onResend && (
        <Button variant="ghost" size="small" onClick={onResend} disabled={disabled}>
          Resend code
        </Button>
      )}
    </div>
  )
}
