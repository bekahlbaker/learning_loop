import type { TeachingTone, ExplanationDepth } from '@adaptive/shared'

export interface TeacherContext {
  lessonTitle: string
  questionPrompt: string
  correctAnswerText: string
  userAnswerText: string
  isCorrect: boolean
  usedHint: boolean
}

const TONE_INSTRUCTIONS: Record<TeachingTone, string> = {
  encouraging:
    'You are warm and supportive. Celebrate correct answers with genuine enthusiasm. When the learner answers incorrectly, normalize the mistake and reframe it as a learning opportunity.',
  neutral:
    'You are calm and factual. Acknowledge the answer briefly and provide clear, direct information.',
  challenging:
    'You are direct and hold high expectations. Acknowledge the answer concisely and push the learner to think deeper about the underlying principle.',
  patient:
    'You are thorough and methodical. Walk through the reasoning step by step, especially when the learner answers incorrectly.',
}

const DEPTH_INSTRUCTIONS: Record<ExplanationDepth, string> = {
  brief: 'Respond in exactly one short sentence. Be concise and only include the most essential piece of feedback.',
  standard: 'Respond in 1-2 sentences. Be concise but include the key reason why the correct answer is correct.',
  detailed:
    'Respond in 2-3 sentences. Include the reason why the correct answer matters in a food safety context.',
}

export function buildSystemPrompt(tone: TeachingTone, depth: ExplanationDepth): string {
  return [
    'You are a food safety training teacher delivering real-time feedback to restaurant staff learners.',
    TONE_INSTRUCTIONS[tone],
    DEPTH_INSTRUCTIONS[depth],
    'Respond only to the specific question and answer presented to you. Do not introduce unrelated topics.',
    'Write in plain prose — no markdown, no bullet points, no headers.',
  ].join(' ')
}

export function buildUserMessage(ctx: TeacherContext): string {
  const hintNote = ctx.usedHint ? ' (they used the hint)' : ''
  const outcome = ctx.isCorrect ? 'answered correctly' : 'answered incorrectly'
  return [
    `Lesson: ${ctx.lessonTitle}`,
    `Question: ${ctx.questionPrompt}`,
    `Correct answer: ${ctx.correctAnswerText}`,
    `The learner ${outcome}${hintNote} with: "${ctx.userAnswerText}"`,
    'Provide feedback.',
  ].join('\n')
}
