import Button from '@/app/components/buttons/Button'
import en from '@/app/messages/en.json'
import type { CurriculumLevelReview } from '@/app/types/curriculum'

export interface LevelReviewIntroProps {
  review: CurriculumLevelReview
  onStart: () => void
}

const copy = en.session.review.intro

export default function LevelReviewIntro({ review, onStart }: LevelReviewIntroProps) {
  return (
    <div className="rounded-2xl bg-white shadow-md p-5 max-w-lg w-full flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 self-start">
          {copy.badge}
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-gray-900">{review.title}</h2>
          <p className="text-sm text-gray-600">{review.description}</p>
        </div>
        <p className="text-sm text-gray-500">
          {review.lessons.length} questions — no hints
        </p>
      </div>
      <Button variant="primary" fullWidth onClick={onStart}>
        {copy.start}
      </Button>
    </div>
  )
}
