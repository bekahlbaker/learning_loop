'use client'

export type AnswerOptionState = 'idle' | 'selected' | 'correct' | 'incorrect'

export interface AnswerOptionProps {
  text: string
  optionId: string
  onSelect: (optionId: string) => void
  state: AnswerOptionState
  disabled?: boolean
}

const STATE_CLASSES: Record<AnswerOptionState, string> = {
  idle: 'border border-gray-300 bg-white text-gray-800',
  selected: 'border-2 border-gray-600 bg-gray-50 text-gray-900',
  correct: 'border-2 border-green-500 bg-green-50 text-green-800',
  incorrect: 'border-2 border-red-400 bg-red-50 text-red-800',
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden={true}
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden={true}
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function AnswerOption({
  text,
  optionId,
  onSelect,
  state,
  disabled = false,
}: AnswerOptionProps) {
  const isInteractive = !disabled && state === 'idle'

  const stateClass = disabled
    ? 'border border-gray-200 bg-gray-50 text-gray-400'
    : STATE_CLASSES[state]

  return (
    <button
      type="button"
      role="radio"
      aria-checked={state !== 'idle'}
      onClick={() => isInteractive && onSelect(optionId)}
      disabled={disabled && state === 'idle'}
      className={[
        'w-full rounded-2xl shadow-sm py-3 px-4 text-sm font-medium',
        'flex items-center justify-between gap-2',
        'min-h-[44px] transition-colors duration-150 motion-reduce:transition-none',
        'focus-ring',
        stateClass,
        isInteractive ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span>{text}</span>
      {state === 'correct' && <CheckIcon />}
      {state === 'incorrect' && <XIcon />}
    </button>
  )
}
