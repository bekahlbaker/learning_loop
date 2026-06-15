'use client'

import { useState, useEffect } from 'react'
import type { CurriculumLesson } from '@/app/types/curriculum'
import type { BrainDirective } from '@adaptive/shared'

interface AnswerRecord {
  optionId: string
  isCorrect: boolean
  usedHint: boolean
}

export interface TeacherExplanationResult {
  explanation: string
  isStreaming: boolean
}

function resolveAnswerTexts(
  lesson: CurriculumLesson,
  answer: AnswerRecord,
): { userAnswerText: string; correctAnswerText: string } | null {
  const q = lesson.question

  if (q.type === 'multiple_choice') {
    const userOption = q.options.find((o) => o.id === answer.optionId)
    const correctOption = q.options.find((o) => o.id === q.correctOptionId)
    if (!userOption || !correctOption) return null
    return { userAnswerText: userOption.text, correctAnswerText: correctOption.text }
  }

  if (q.type === 'true_false') {
    const userAnswerText = answer.optionId === 'true' ? 'True' : 'False'
    const correctAnswerText = q.correctAnswer ? 'True' : 'False'
    return { userAnswerText, correctAnswerText }
  }

  return null
}

export function useTeacherExplanation(
  lesson: CurriculumLesson | null,
  answer: AnswerRecord | null,
  directive: BrainDirective,
): TeacherExplanationResult {
  const [explanation, setExplanation] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  // Intentionally excludes `directive` from deps: if tone/depth change mid-answer
  // we do not restart a stream already in progress.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!lesson || !answer) {
      setExplanation('')
      setIsStreaming(false)
      return
    }

    const resolved = resolveAnswerTexts(lesson, answer)
    if (!resolved) return

    let cancelled = false
    setExplanation('')
    setIsStreaming(true)

    fetch('/api/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonTitle: lesson.title,
        questionPrompt: lesson.question.prompt,
        correctAnswerText: resolved.correctAnswerText,
        userAnswerText: resolved.userAnswerText,
        isCorrect: answer.isCorrect,
        usedHint: answer.usedHint,
        teachingTone: directive.teachingTone,
        explanationDepth: directive.explanationDepth,
      }),
    })
      .then(async (res) => {
        if (!res.ok || !res.body) return
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break
          const chunk = decoder.decode(value, { stream: true })
          setExplanation((prev) => prev + chunk)
        }
      })
      .catch(() => {
        // Silent failure — explanation stays empty, Continue button becomes available
      })
      .finally(() => {
        if (!cancelled) setIsStreaming(false)
      })

    return () => {
      cancelled = true
    }
  }, [lesson?.id, answer?.optionId])

  return { explanation, isStreaming }
}
