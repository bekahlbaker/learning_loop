import MultipleChoiceQuestion from '@/app/components/session/MultipleChoiceQuestion'
import TrueFalseQuestion from '@/app/components/session/TrueFalseQuestion'
import type { CurriculumQuestion } from '@/app/types/curriculum'
import type { ExplanationDepth } from '@/app/types/brain'

export interface QuestionBlockProps {
  question: CurriculumQuestion
  onAnswer: (optionId: string, isCorrect: boolean) => void
  disabled?: boolean
  explanationDepth: ExplanationDepth
}

export default function QuestionBlock({
  question,
  onAnswer,
  disabled,
  explanationDepth,
}: QuestionBlockProps) {
  if (question.type === 'multiple_choice') {
    return (
      <MultipleChoiceQuestion
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        explanationDepth={explanationDepth}
      />
    )
  }

  if (question.type === 'true_false') {
    return (
      <TrueFalseQuestion
        question={question}
        onAnswer={(answer, isCorrect) => onAnswer(String(answer), isCorrect)}
        disabled={disabled}
        explanationDepth={explanationDepth}
      />
    )
  }

  // TypeScript exhaustiveness — new question types become a compile error
  const _exhaustive: never = question
  return null
}
