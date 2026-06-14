import type { TeachingTone } from '@/app/types/brain'

export interface LessonContextHeaderProps {
  levelTitle: string
  lessonTitle: string
  lessonIndex: number
  totalLessons: number
  overallMastery: number
  teachingTone: TeachingTone
}

export default function LessonContextHeader({
  levelTitle,
  lessonTitle,
  lessonIndex,
  totalLessons,
  overallMastery,
  teachingTone,
}: LessonContextHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-xs text-gray-500 truncate">
          {levelTitle} · Lesson {lessonIndex} of {totalLessons}
        </span>
        <span className="text-sm font-semibold text-gray-900 leading-snug">{lessonTitle}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {overallMastery > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {overallMastery}% mastery
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
          {teachingTone}
        </span>
      </div>
    </div>
  )
}
