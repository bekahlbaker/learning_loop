'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import FlashCard from '@/app/components/session/FlashCard'
import AnswerFeedback from '@/app/components/session/AnswerFeedback'
import LevelReviewIntro from '@/app/components/session/LevelReviewIntro'
import LevelReviewResult from '@/app/components/session/LevelReviewResult'
import Button from '@/app/components/buttons/Button'
import { useMockBrainDirective } from '@/app/hooks/useMockBrainDirective'
import { useTeacherExplanation } from '@/app/hooks/useTeacherExplanation'
import { useEventCapture } from '@/app/hooks/useEventCapture'
import en from '@/app/messages/en.json'
import { CURRICULUM, type PersonaId, type Curriculum } from '@adaptive/shared'
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
  const { emitEvent } = useEventCapture(personaId)

  const sessionStartAtRef = useRef<number>(Date.now())
  const questionShownAtRef = useRef<number>(Date.now())
  const lessonsAttemptedRef = useRef<number>(0)
  const lessonsCompletedRef = useRef<number>(0)

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
    const loaded = CURRICULUM
    setCurriculum(loaded)
    setSessionState('active')
    setFlashCardStatus('idle')

    const firstLevel = loaded.levels[0]
    const firstLesson = firstLevel?.lessons[0]
    sessionStartAtRef.current = Date.now()
    questionShownAtRef.current = Date.now()

    emitEvent('session_started', { resumedFromLessonId: null })

    if (firstLevel) {
      emitEvent('level_started', { levelId: firstLevel.id, isRestart: false })
    }
    if (firstLesson && firstLevel) {
      emitEvent('lesson_started', {
        lessonId: firstLesson.id,
        levelId: firstLevel.id,
        isRevisit: false,
        directiveInEffect: directive.directiveType,
      })
      emitEvent('question_shown', {
        lessonId: firstLesson.id,
        levelId: firstLevel.id,
        questionFormat: firstLesson.question.type,
        attemptNumber: 1,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (currentLesson && currentLevel) {
      const isMC = currentLesson.question.type === 'multiple_choice'
      const answerLatencyMs = Date.now() - questionShownAtRef.current
      lessonsAttemptedRef.current += 1

      if (sessionPhase === 'lessons') {
        if (isCorrect) lessonsCompletedRef.current += 1
        emitEvent('answer_submitted', {
          lessonId: currentLesson.id,
          levelId: currentLevel.id,
          questionFormat: currentLesson.question.type,
          selectedOptionId: isMC ? optionId : null,
          selectedBooleanAnswer: isMC ? null : optionId === 'true',
          isCorrect,
          attemptNumber: 1,
          hintUsed: usedHint,
          answerLatencyMs,
          pointsAwarded: isCorrect ? (usedHint ? 7 : 10) : 0,
        })
      } else if (sessionPhase === 'review') {
        if (isCorrect) setReviewCorrectCount((c) => c + 1)
        emitEvent('review_answer_submitted', {
          levelId: currentLevel.id,
          reviewId: currentLevel.review.id,
          lessonId: currentLesson.id,
          questionFormat: currentLesson.question.type,
          selectedOptionId: isMC ? optionId : null,
          selectedBooleanAnswer: isMC ? null : optionId === 'true',
          isCorrect,
          hintUsed: usedHint,
          answerLatencyMs,
        })
      }
    } else if (sessionPhase === 'review' && isCorrect) {
      setReviewCorrectCount((c) => c + 1)
    }
  }

  const handleHintReveal = () => {
    if (!currentLesson || !currentLevel) return
    const timeInQuestionMs = Date.now() - questionShownAtRef.current
    emitEvent('hint_requested', {
      lessonId: currentLesson.id,
      levelId: currentLevel.id,
      attemptNumber: 1,
      timeInQuestionMs,
    })
    emitEvent('hint_shown', {
      lessonId: currentLesson.id,
      levelId: currentLevel.id,
    })
  }

  const handleContinue = () => {
    setLastAnswer(null)
    if (sessionPhase === 'lessons') {
      const isLastLesson = currentLessonIndexInLevel >= (currentLevel?.lessons.length ?? 0) - 1
      if (isLastLesson) {
        setSessionPhase('review-intro')
      } else {
        const nextIndex = currentLessonIndexInLevel + 1
        const nextLesson = currentLevel?.lessons[nextIndex]
        setCurrentLessonIndexInLevel(nextIndex)
        setFlashCardStatus('idle')
        questionShownAtRef.current = Date.now()
        if (nextLesson && currentLevel) {
          emitEvent('lesson_started', {
            lessonId: nextLesson.id,
            levelId: currentLevel.id,
            isRevisit: false,
            directiveInEffect: directive.directiveType,
          })
          emitEvent('question_shown', {
            lessonId: nextLesson.id,
            levelId: currentLevel.id,
            questionFormat: nextLesson.question.type,
            attemptNumber: 1,
          })
        }
      }
    } else if (sessionPhase === 'review') {
      const isLastQuestion = currentReviewQuestionIndex >= (currentLevel?.review.lessons.length ?? 0) - 1
      if (isLastQuestion) {
        setSessionPhase('review-result')
        if (currentLevel) {
          const passed = reviewCorrectCount >= REVIEW_PASS_THRESHOLD
          emitEvent('level_review_completed', {
            levelId: currentLevel.id,
            reviewId: currentLevel.review.id,
            passed,
            durationMs: 0,
            masteryScoreAfter: 0,
          })
        }
      } else {
        const nextIndex = currentReviewQuestionIndex + 1
        const nextCard = currentLevel?.review.lessons[nextIndex]
        setCurrentReviewQuestionIndex(nextIndex)
        setFlashCardStatus('idle')
        questionShownAtRef.current = Date.now()
        if (nextCard && currentLevel) {
          emitEvent('review_card_shown', {
            levelId: currentLevel.id,
            reviewId: currentLevel.review.id,
            lessonId: nextCard.id,
            cardOrder: nextIndex,
          })
          emitEvent('question_shown', {
            lessonId: nextCard.id,
            levelId: currentLevel.id,
            questionFormat: nextCard.question.type,
            attemptNumber: 1,
          })
        }
      }
    }
  }

  const handleStartReview = () => {
    setCurrentReviewQuestionIndex(0)
    setReviewCorrectCount(0)
    setLastAnswer(null)
    setFlashCardStatus('idle')
    setSessionPhase('review')
    questionShownAtRef.current = Date.now()

    if (currentLevel) {
      const firstCard = currentLevel.review.lessons[0]
      emitEvent('level_review_started', {
        levelId: currentLevel.id,
        reviewId: currentLevel.review.id,
        triggeredBy: 'level_completion',
      })
      if (firstCard) {
        emitEvent('review_card_shown', {
          levelId: currentLevel.id,
          reviewId: currentLevel.review.id,
          lessonId: firstCard.id,
          cardOrder: 0,
        })
        emitEvent('question_shown', {
          lessonId: firstCard.id,
          levelId: currentLevel.id,
          questionFormat: firstCard.question.type,
          attemptNumber: 1,
        })
      }
    }
  }

  const handleReviewContinue = () => {
    const isLastLevel = currentLevelIndex >= (curriculum?.levels.length ?? 0) - 1
    if (isLastLevel) {
      emitEvent('session_ended', {
        durationMs: Date.now() - sessionStartAtRef.current,
        reason: 'completed',
        lessonsAttempted: lessonsAttemptedRef.current,
        lessonsCompleted: lessonsCompletedRef.current,
        overallMasteryAtEnd: directive.overallMastery,
      })
      setSessionState('completed')
    } else {
      const nextLevelIndex = currentLevelIndex + 1
      const nextLevel = curriculum?.levels[nextLevelIndex]
      const nextLesson = nextLevel?.lessons[0]
      setCurrentLevelIndex(nextLevelIndex)
      setCurrentLessonIndexInLevel(0)
      setCurrentReviewQuestionIndex(0)
      setReviewCorrectCount(0)
      setLastAnswer(null)
      setSessionPhase('lessons')
      setFlashCardStatus('idle')
      questionShownAtRef.current = Date.now()
      if (nextLevel) {
        emitEvent('level_started', { levelId: nextLevel.id, isRestart: false })
      }
      if (nextLesson && nextLevel) {
        emitEvent('lesson_started', {
          lessonId: nextLesson.id,
          levelId: nextLevel.id,
          isRevisit: false,
          directiveInEffect: directive.directiveType,
        })
        emitEvent('question_shown', {
          lessonId: nextLesson.id,
          levelId: nextLevel.id,
          questionFormat: nextLesson.question.type,
          attemptNumber: 1,
        })
      }
    }
  }

  const handleRetryReview = () => {
    setCurrentReviewQuestionIndex(0)
    setReviewCorrectCount(0)
    setLastAnswer(null)
    setSessionPhase('review-intro')
  }

  const handleRetry = () => {
    const loaded = CURRICULUM
    setCurriculum(loaded)
    setCurrentLevelIndex(0)
    setCurrentLessonIndexInLevel(0)
    setCurrentReviewQuestionIndex(0)
    setReviewCorrectCount(0)
    setSessionPhase('lessons')
    setLastAnswer(null)
    setSessionState('active')
    setFlashCardStatus('idle')
    lessonsAttemptedRef.current = 0
    lessonsCompletedRef.current = 0
    sessionStartAtRef.current = Date.now()
    questionShownAtRef.current = Date.now()

    const firstLevel = loaded.levels[0]
    const firstLesson = firstLevel?.lessons[0]
    emitEvent('session_started', { resumedFromLessonId: null })
    if (firstLevel) {
      emitEvent('level_started', { levelId: firstLevel.id, isRestart: false })
    }
    if (firstLesson && firstLevel) {
      emitEvent('lesson_started', {
        lessonId: firstLesson.id,
        levelId: firstLevel.id,
        isRevisit: false,
        directiveInEffect: directive.directiveType,
      })
      emitEvent('question_shown', {
        lessonId: firstLesson.id,
        levelId: firstLevel.id,
        questionFormat: firstLesson.question.type,
        attemptNumber: 1,
      })
    }
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
        onHintReveal={handleHintReveal}
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
