import Button from '@/app/components/buttons/Button'
import en from '@/app/messages/en.json'
import type { TeachingTone } from '@/app/types/brain'

export interface AnswerFeedbackProps {
  isCorrect: boolean
  /** Reserved for L4 AI teacher framing; accepted but unused in L3 */
  teachingTone: TeachingTone
  onContinue: () => void
}

function CorrectIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden={true}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function IncorrectIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden={true}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const copy = en.session.feedback

export default function AnswerFeedback({ isCorrect, onContinue }: AnswerFeedbackProps) {
  return (
    <div
      className={[
        'rounded-2xl shadow-sm p-4 mt-3 flex flex-col gap-3',
        isCorrect
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-400',
      ].join(' ')}
    >
      <div
        className={[
          'flex items-center gap-2 text-sm font-medium',
          isCorrect ? 'text-green-800' : 'text-red-800',
        ].join(' ')}
      >
        {isCorrect ? <CorrectIcon /> : <IncorrectIcon />}
        <span>{isCorrect ? copy.correct : copy.incorrect}</span>
      </div>
      <Button variant="primary" fullWidth onClick={onContinue}>
        {copy.continue}
      </Button>
    </div>
  )
}
