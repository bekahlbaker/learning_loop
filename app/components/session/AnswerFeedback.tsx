import Button from '@/app/components/buttons/Button'
import en from '@/app/messages/en.json'
import type { TeachingTone } from '@adaptive/shared'

export interface AnswerFeedbackProps {
  isCorrect: boolean
  teachingTone: TeachingTone
  explanation: string
  isStreaming: boolean
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

export default function AnswerFeedback({
  isCorrect,
  explanation,
  isStreaming,
  onContinue,
}: AnswerFeedbackProps) {
  const waitingForFirstToken = isStreaming && explanation === ''
  const showSkeleton = waitingForFirstToken
  const showExplanation = explanation !== ''

  return (
    <div
      className={[
        'rounded-2xl shadow-sm p-4 mt-3 flex flex-col gap-3',
        isCorrect
          ? 'bg-green-50 border border-green-200'
          : 'bg-red-50 border border-red-400',
      ].join(' ')}
    >
      <div className={isCorrect ? 'text-green-800' : 'text-red-800'}>
        {isCorrect ? <CorrectIcon /> : <IncorrectIcon />}
      </div>

      {showSkeleton && (
        <div className="flex flex-col gap-1.5" aria-hidden={true}>
          <div className="h-3 rounded bg-current opacity-10 animate-pulse w-full" />
          <div className="h-3 rounded bg-current opacity-10 animate-pulse w-4/5" />
        </div>
      )}

      {showExplanation && (
        <p
          className={[
            'text-sm leading-relaxed',
            isCorrect ? 'text-green-900' : 'text-red-900',
          ].join(' ')}
        >
          {explanation}
        </p>
      )}

      <Button
        variant="primary"
        fullWidth
        onClick={onContinue}
        disabled={waitingForFirstToken}
      >
        {copy.continue}
      </Button>
    </div>
  )
}
