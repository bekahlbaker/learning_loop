'use client'

import { useState } from 'react'
import LessonContextHeader from '@/app/components/session/LessonContextHeader'
import LessonContentBlock from '@/app/components/session/LessonContentBlock'
import HintReveal from '@/app/components/session/HintReveal'
import QuestionBlock from '@/app/components/session/QuestionBlock'
import type { CurriculumLesson } from '@/app/types/curriculum'
import type { BrainDirective } from '@adaptive/shared'

export type FlashCardStatus = 'loading' | 'idle' | 'answered'

export interface FlashCardLevelContext {
  levelTitle: string
  lessonIndex: number
  totalLessons: number
  itemLabel?: string
}

export interface FlashCardProps {
  lesson: CurriculumLesson | null
  directive: BrainDirective
  levelContext: FlashCardLevelContext
  status: FlashCardStatus
  onAnswer: (optionId: string, isCorrect: boolean, usedHint: boolean) => void
  onHintReveal?: () => void
  isReview?: boolean
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <SkeletonBlock className="h-10 w-3/4" />
      <SkeletonBlock className="h-24" />
      <SkeletonBlock className="h-4 w-1/4" />
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-11" />
        <SkeletonBlock className="h-11" />
        <SkeletonBlock className="h-11" />
      </div>
    </div>
  )
}

export default function FlashCard({
  lesson,
  directive,
  levelContext,
  status,
  onAnswer,
  onHintReveal,
  isReview = false,
}: FlashCardProps) {
  const [usedHint, setUsedHint] = useState(false)

  const handleAnswer = (optionId: string, isCorrect: boolean) => {
    onAnswer(optionId, isCorrect, usedHint)
  }

  const handleHintReveal = () => {
    setUsedHint(true)
    onHintReveal?.()
  }

  const isAnswered = status === 'answered'

  if (status === 'loading') {
    return (
      <div className="rounded-2xl bg-white shadow-md p-5 max-w-lg w-full">
        <LoadingSkeleton />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="rounded-2xl bg-white shadow-md p-5 max-w-lg w-full flex items-center justify-center py-12">
        <p className="text-sm text-gray-500">No lessons available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white shadow-md p-5 max-w-lg w-full flex flex-col gap-5">
      <LessonContextHeader
        levelTitle={levelContext.levelTitle}
        lessonTitle={lesson.title}
        lessonIndex={levelContext.lessonIndex}
        totalLessons={levelContext.totalLessons}
        overallMastery={directive.overallMastery}
        teachingTone={directive.teachingTone}
        itemLabel={levelContext.itemLabel}
      />

      <LessonContentBlock content={lesson.content} />

      {!isReview && (
        <HintReveal
          hint={lesson.hint}
          onReveal={handleHintReveal}
          disabled={isAnswered}
        />
      )}

      <QuestionBlock
        question={lesson.question}
        onAnswer={handleAnswer}
        disabled={isAnswered}
        explanationDepth={directive.explanationDepth}
      />
    </div>
  )
}
