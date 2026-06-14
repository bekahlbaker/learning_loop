'use client'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Button from '@/src/components/buttons/Button'
import en from '@/src/messages/en.json'

export interface DateInputProps {
  value: Date | null
  onChange: (date: Date | null) => void
  onSubmit: (date: Date | null) => void
  onSkip?: () => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  disabled?: boolean
}

export default function DateInput({
  value,
  onChange,
  onSubmit,
  onSkip,
  minDate,
  maxDate,
  placeholder,
  disabled = false,
}: DateInputProps) {
  const handleSkip = () => {
    onSkip?.()
    onSubmit(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <DatePicker
          selected={value}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholderText={placeholder ?? en.onboarding.steps.deadline.placeholder}
          disabled={disabled}
          dateFormat="MMMM d, yyyy"
          popperClassName="!z-50"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Button onClick={() => onSubmit(value)} disabled={disabled || !value} size="default">
          {en.onboarding.inputs.confirm}
        </Button>
      </div>
      {onSkip && (
        <button
          type="button"
          onClick={handleSkip}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-gray-700 underline self-start focus-ring rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {en.onboarding.steps.deadline.skip}
        </button>
      )}
    </div>
  )
}
