'use client'

import { useState } from 'react'
import AnswerOption from '@/app/components/session/AnswerOption'
import type { AnswerOptionState } from '@/app/components/session/AnswerOption'
import type { TrueFalseQuestion as TFQ } from '@adaptive/shared'
import type { ExplanationDepth } from '@adaptive/shared'

export interface TrueFalseQuestionProps {
  question: TFQ
  onAnswer: (answer: boolean, isCorrect: boolean) => void
  disabled?: boolean
  /** Reserved for L4 AI teacher; accepted but unused in L3 */
  explanationDepth: ExplanationDepth
}

const OPTIONS: Array<{ label: string; value: boolean; id: string }> = [
  { label: 'True', value: true, id: 'true' },
  { label: 'False', value: false, id: 'false' },
]

export default function TrueFalseQuestion({
  question,
  onAnswer,
  disabled = false,
}: TrueFalseQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleSelect = (optionId: string) => {
    if (selectedId !== null || disabled) return
    const selected = OPTIONS.find((o) => o.id === optionId)!
    const isCorrect = selected.value === question.correctAnswer
    setSelectedId(optionId)
    onAnswer(selected.value, isCorrect)
  }

  const getState = (optionId: string): AnswerOptionState => {
    if (selectedId === null) return 'idle'
    if (optionId === selectedId) {
      const selected = OPTIONS.find((o) => o.id === optionId)!
      return selected.value === question.correctAnswer ? 'correct' : 'incorrect'
    }
    return 'idle'
  }

  return (
    <div role="radiogroup" aria-label={question.prompt}>
      <p className="text-sm font-medium text-gray-800 mb-3">{question.prompt}</p>
      <div className="flex gap-3">
        {OPTIONS.map((option) => {
          const state = getState(option.id)
          const isDisabled = disabled || (selectedId !== null && state === 'idle')
          return (
            <div key={option.id} className="flex-1">
              <AnswerOption
                text={option.label}
                optionId={option.id}
                onSelect={handleSelect}
                state={state}
                disabled={isDisabled}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
