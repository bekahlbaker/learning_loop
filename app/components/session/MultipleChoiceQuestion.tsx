'use client'

import { useState } from 'react'
import AnswerOption from '@/app/components/session/AnswerOption'
import type { AnswerOptionState } from '@/app/components/session/AnswerOption'
import type { MultipleChoiceQuestion as MCQ } from '@/app/types/curriculum'
import type { ExplanationDepth } from '@/app/types/brain'

export interface MultipleChoiceQuestionProps {
  question: MCQ
  onAnswer: (optionId: string, isCorrect: boolean) => void
  disabled?: boolean
  /** Reserved for L4 AI teacher; accepted but unused in L3 */
  explanationDepth: ExplanationDepth
}

export default function MultipleChoiceQuestion({
  question,
  onAnswer,
  disabled = false,
}: MultipleChoiceQuestionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  if (question.options.length === 0) {
    return <p className="text-sm text-gray-500">No options available.</p>
  }

  const handleSelect = (optionId: string) => {
    if (selectedOptionId !== null || disabled) return
    const isCorrect = optionId === question.correctOptionId
    setSelectedOptionId(optionId)
    onAnswer(optionId, isCorrect)
  }

  const getState = (optionId: string): AnswerOptionState => {
    if (selectedOptionId === null) return 'idle'
    if (optionId === selectedOptionId) {
      return optionId === question.correctOptionId ? 'correct' : 'incorrect'
    }
    return 'idle'
  }

  return (
    <div role="radiogroup" aria-label={question.prompt}>
      <p className="text-sm font-medium text-gray-800 mb-3">{question.prompt}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => {
          const state = getState(option.id)
          const isDisabled = disabled || (selectedOptionId !== null && state === 'idle')
          return (
            <AnswerOption
              key={option.id}
              text={option.text}
              optionId={option.id}
              onSelect={handleSelect}
              state={state}
              disabled={isDisabled}
            />
          )
        })}
      </div>
    </div>
  )
}
