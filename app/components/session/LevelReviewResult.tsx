import Button from '@/app/components/buttons/Button'
import en from '@/app/messages/en.json'
import type { CurriculumLevelReview } from '@adaptive/shared'

export interface LevelReviewResultProps {
  review: CurriculumLevelReview
  correctCount: number
  totalCount: number
  passed: boolean
  isLastLevel: boolean
  onContinue: () => void
  onRetry: () => void
}

const copy = en.session.review.result

export default function LevelReviewResult({
  review,
  correctCount,
  totalCount,
  passed,
  isLastLevel,
  onContinue,
  onRetry,
}: LevelReviewResultProps) {
  return (
    <div className="rounded-2xl bg-white shadow-md p-5 max-w-lg w-full flex flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-gray-900">{copy.title}</h2>
        <p className="text-sm text-gray-500">{review.title}</p>
      </div>

      <div
        className={[
          'rounded-xl p-6 flex flex-col items-center gap-1',
          passed
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200',
        ].join(' ')}
      >
        <span
          className={[
            'text-4xl font-bold tabular-nums',
            passed ? 'text-green-700' : 'text-red-700',
          ].join(' ')}
        >
          {correctCount}/{totalCount}
        </span>
        <span
          className={[
            'text-xs font-medium',
            passed ? 'text-green-600' : 'text-red-600',
          ].join(' ')}
        >
          {passed ? 'Passed' : 'Not passed'}
        </span>
      </div>

      <p className="text-sm text-gray-700">
        {passed ? copy.pass.message : copy.fail.message}
      </p>

      {passed ? (
        <Button variant="primary" fullWidth onClick={onContinue}>
          {isLastLevel ? copy.pass.finish : copy.pass.nextLevel}
        </Button>
      ) : (
        <Button variant="primary" fullWidth onClick={onRetry}>
          {copy.fail.retry}
        </Button>
      )}
    </div>
  )
}
