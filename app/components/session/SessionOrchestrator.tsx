'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FlashCard from '@/app/components/session/FlashCard'
import AnswerFeedback from '@/app/components/session/AnswerFeedback'
import Button from '@/app/components/buttons/Button'
import { useMockBrainDirective } from '@/app/hooks/useMockBrainDirective'
import en from '@/app/messages/en.json'
import type { PersonaId } from '@/app/types/brain'
import type { Curriculum, CurriculumLesson } from '@/app/types/curriculum'
import type { FlashCardStatus } from '@/app/components/session/FlashCard'

export interface SessionOrchestratorProps {
  personaId?: PersonaId
}

type SessionState = 'loading' | 'active' | 'completed' | 'error'

interface AnswerRecord {
  optionId: string
  isCorrect: boolean
  usedHint: boolean
}

const copy = en.session.orchestrator

export default function SessionOrchestrator({
  personaId = 'new',
}: SessionOrchestratorProps) {
  const directive = useMockBrainDirective(personaId)

  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [flashCardStatus, setFlashCardStatus] = useState<FlashCardStatus>('loading')
  const [lastAnswer, setLastAnswer] = useState<AnswerRecord | null>(null)

  useEffect(() => {
    let cancelled = false
    import('@/app/constants/curriculum.json')
      .then((mod) => {
        if (cancelled) return
        setCurriculum(mod.curriculum as Curriculum)
        setSessionState('active')
        setFlashCardStatus('idle')
      })
      .catch(() => {
        if (!cancelled) setSessionState('error')
      })
    return () => { cancelled = true }
  }, [])

  // All lessons across all levels in order
  const allLessons: Array<{ lesson: CurriculumLesson; levelTitle: string; totalInLevel: number; indexInLevel: number }> =
    curriculum?.levels.flatMap((level) =>
      level.lessons.map((lesson, i) => ({
        lesson,
        levelTitle: level.title,
        totalInLevel: level.lessons.length,
        indexInLevel: i + 1,
      }))
    ) ?? []

  const currentEntry = allLessons[currentLessonIndex] ?? null

  const handleAnswer = (optionId: string, isCorrect: boolean, usedHint: boolean) => {
    setLastAnswer({ optionId, isCorrect, usedHint })
    setFlashCardStatus('answered')
  }

  const handleContinue = () => {
    const nextIndex = currentLessonIndex + 1
    if (nextIndex >= allLessons.length) {
      setSessionState('completed')
    } else {
      setCurrentLessonIndex(nextIndex)
      setFlashCardStatus('idle')
      setLastAnswer(null)
    }
  }

  const handleRetry = () => {
    setSessionState('loading')
    setFlashCardStatus('loading')
    import('@/app/constants/curriculum.json')
      .then((mod) => {
        setCurriculum(mod.curriculum as Curriculum)
        setCurrentLessonIndex(0)
        setLastAnswer(null)
        setSessionState('active')
        setFlashCardStatus('idle')
      })
      .catch(() => setSessionState('error'))
  }

  if (sessionState === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-gray-700">{copy.error}</p>
        <Button variant="primary" onClick={handleRetry}>
          {copy.retry}
        </Button>
      </div>
    )
  }

  if (sessionState === 'completed') {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-lg font-semibold text-gray-900">{copy.completed.title}</h2>
        <p className="text-sm text-gray-600">{copy.completed.message}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl font-medium transition-colors focus-ring bg-gray-800 text-white shadow-sm hover:bg-gray-700 py-2.5 px-5 text-sm"
        >
          {copy.completed.backHome}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      <FlashCard
        lesson={currentEntry?.lesson ?? null}
        directive={directive}
        levelContext={
          currentEntry
            ? {
                levelTitle: currentEntry.levelTitle,
                lessonIndex: currentEntry.indexInLevel,
                totalLessons: currentEntry.totalInLevel,
              }
            : { levelTitle: '', lessonIndex: 0, totalLessons: 0 }
        }
        status={flashCardStatus}
        onAnswer={handleAnswer}
      />
      {flashCardStatus === 'answered' && lastAnswer && (
        <AnswerFeedback
          isCorrect={lastAnswer.isCorrect}
          teachingTone={directive.teachingTone}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}
