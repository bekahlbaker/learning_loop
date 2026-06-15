'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import FlashCard from '@/app/components/session/FlashCard'
import AnswerFeedback from '@/app/components/session/AnswerFeedback'
import LevelReviewIntro from '@/app/components/session/LevelReviewIntro'
import LevelReviewResult from '@/app/components/session/LevelReviewResult'
import Button from '@/app/components/buttons/Button'
import { useMockBrainDirective } from '@/app/hooks/useMockBrainDirective'
import { useTeacherExplanation } from '@/app/hooks/useTeacherExplanation'
import en from '@/app/messages/en.json'
import type { PersonaId } from '@adaptive/shared'
import type { Curriculum } from '@/app/types/curriculum'
import type { FlashCardStatus } from '@/app/components/session/FlashCard'

export interface SessionOrchestratorProps {
  personaId?: PersonaId
}

type SessionState = 'loading' | 'active' | 'completed' | 'error'
type SessionPhase = 'lessons' | 'review-intro' | 'review' | 'review-result'

interface AnswerRecord {
  optionId: string
  isCorrect: boolean
  usedHint: boolean
}

const REVIEW_PASS_THRESHOLD = 2

const copy = en.session.orchestrator

export default function SessionOrchestrator({
  personaId = 'new',
}: SessionOrchestratorProps) {
  const directive = useMockBrainDirective(personaId)

  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [currentLessonIndexInLevel, setCurrentLessonIndexInLevel] = useState(0)
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('lessons')
  const [currentReviewQuestionIndex, setCurrentReviewQuestionIndex] = useState(0)
  const [reviewCorrectCount, setReviewCorrectCount] = useState(0)
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

  const currentLevel = curriculum?.levels[currentLevelIndex] ?? null

  const currentLesson = (() => {
    if (!currentLevel) return null
    if (sessionPhase === 'lessons') return currentLevel.lessons[currentLessonIndexInLevel] ?? null
    if (sessionPhase === 'review') return currentLevel.review.lessons[currentReviewQuestionIndex] ?? null
    return null
  })()

  // Pass null during review — AI teacher only explains answers in regular lesson flow
  const lessonForTeacher = sessionPhase === 'lessons' ? currentLesson : null
  const { explanation, isStreaming } = useTeacherExplanation(lessonForTeacher, lastAnswer, directive)

  const handleAnswer = (optionId: string, isCorrect: boolean, usedHint: boolean) => {
    setLastAnswer({ optionId, isCorrect, usedHint })
    setFlashCardStatus('answered')
    if (sessionPhase === 'review' && isCorrect) {
      setReviewCorrectCount((c) => c + 1)
    }
  }

  const handleContinue = () => {
    setLastAnswer(null)
    if (sessionPhase === 'lessons') {
      const isLastLesson = currentLessonIndexInLevel >= (currentLevel?.lessons.length ?? 0) - 1
      if (isLastLesson) {
        setSessionPhase('review-intro')
      } else {
        setCurrentLessonIndexInLevel((i) => i + 1)
        setFlashCardStatus('idle')
      }
    } else if (sessionPhase === 'review') {
      const isLastQuestion = currentReviewQuestionIndex >= (currentLevel?.review.lessons.length ?? 0) - 1
      if (isLastQuestion) {
        setSessionPhase('review-result')
      } else {
        setCurrentReviewQuestionIndex((i) => i + 1)
        setFlashCardStatus('idle')
      }
    }
  }

  const handleStartReview = () => {
    setCurrentReviewQuestionIndex(0)
    setReviewCorrectCount(0)
    setLastAnswer(null)
    setFlashCardStatus('idle')
    setSessionPhase('review')
  }

  const handleReviewContinue = () => {
    const isLastLevel = currentLevelIndex >= (curriculum?.levels.length ?? 0) - 1
    if (isLastLevel) {
      setSessionState('completed')
    } else {
      setCurrentLevelIndex((i) => i + 1)
      setCurrentLessonIndexInLevel(0)
      setCurrentReviewQuestionIndex(0)
      setReviewCorrectCount(0)
      setLastAnswer(null)
      setSessionPhase('lessons')
      setFlashCardStatus('idle')
    }
  }

  const handleRetryReview = () => {
    setCurrentReviewQuestionIndex(0)
    setReviewCorrectCount(0)
    setLastAnswer(null)
    setSessionPhase('review-intro')
  }

  const handleRetry = () => {
    setSessionState('loading')
    setFlashCardStatus('loading')
    import('@/app/constants/curriculum.json')
      .then((mod) => {
        setCurriculum(mod.curriculum as Curriculum)
        setCurrentLevelIndex(0)
        setCurrentLessonIndexInLevel(0)
        setCurrentReviewQuestionIndex(0)
        setReviewCorrectCount(0)
        setSessionPhase('lessons')
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

  if (sessionPhase === 'review-intro' && currentLevel) {
    return (
      <LevelReviewIntro
        review={currentLevel.review}
        onStart={handleStartReview}
      />
    )
  }

  if (sessionPhase === 'review-result' && currentLevel) {
    const totalCount = currentLevel.review.lessons.length
    const passed = reviewCorrectCount >= REVIEW_PASS_THRESHOLD
    const isLastLevel = currentLevelIndex >= (curriculum?.levels.length ?? 0) - 1
    return (
      <LevelReviewResult
        review={currentLevel.review}
        correctCount={reviewCorrectCount}
        totalCount={totalCount}
        passed={passed}
        isLastLevel={isLastLevel}
        onContinue={handleReviewContinue}
        onRetry={handleRetryReview}
      />
    )
  }

  const isReview = sessionPhase === 'review'
  const levelContext = currentLevel
    ? isReview
      ? {
          levelTitle: currentLevel.review.title,
          lessonIndex: currentReviewQuestionIndex + 1,
          totalLessons: currentLevel.review.lessons.length,
          itemLabel: 'Question',
        }
      : {
          levelTitle: currentLevel.title,
          lessonIndex: currentLessonIndexInLevel + 1,
          totalLessons: currentLevel.lessons.length,
        }
    : { levelTitle: '', lessonIndex: 0, totalLessons: 0 }

  const flashCardKey = currentLesson?.id ?? `${currentLevelIndex}-${sessionPhase}-${isReview ? currentReviewQuestionIndex : currentLessonIndexInLevel}`

  return (
    <div className="flex flex-col gap-0">
      <FlashCard
        key={flashCardKey}
        lesson={currentLesson}
        directive={directive}
        levelContext={levelContext}
        status={flashCardStatus}
        onAnswer={handleAnswer}
        isReview={isReview}
      />
      {flashCardStatus === 'answered' && lastAnswer && (
        <AnswerFeedback
          isCorrect={lastAnswer.isCorrect}
          teachingTone={directive.teachingTone}
          explanation={explanation}
          isStreaming={isStreaming}
          onContinue={handleContinue}
        />
      )}
    </div>
  )
}
