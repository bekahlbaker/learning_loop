'use client'

export interface OptionButtonProps {
  label: string
  value: string
  onSelect: (value: string) => void
  selected?: boolean
  disabled?: boolean
}

export default function OptionButton({
  label,
  value,
  onSelect,
  selected = false,
  disabled = false,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(value)}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'w-full rounded-2xl px-4 py-3 text-sm font-medium text-left shadow-sm transition-colors min-h-[44px] focus-ring',
        selected
          ? 'border-2 border-gray-800 bg-gray-50 text-gray-900'
          : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50',
        disabled && !selected ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </button>
  )
}
