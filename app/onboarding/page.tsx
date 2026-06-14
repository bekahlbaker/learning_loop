'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import OnboardingLayout from '@/src/components/layouts/OnboardingLayout'
import ChatContainer from '@/src/components/chat/ChatContainer'
import ChatThread from '@/src/components/chat/ChatThread'
import InputArea from '@/src/components/chat/InputArea'
import type { InputType } from '@/src/components/chat/InputArea'
import type { Message } from '@/src/components/chat/ChatThread'
import type {
  ConfidenceLevel,
  CourseReason,
  CurrentRole,
  DailyMinutes,
  DaysPerWeek,
  LearningStyle,
  OnboardingAnswers,
  RestaurantExperience,
  TimeOfDay,
} from '@/app/types/onboarding'
import en from '@/src/messages/en.json'

// ─── Partial answers accumulated during the flow ────────────────────────────

interface PartialAnswers {
  name?: string
  phone?: string
  preferredTimeOfDay?: TimeOfDay
  completionDeadline?: string | null
  dailyMinutes?: DailyMinutes
  daysPerWeek?: DaysPerWeek
  confidenceLevel?: ConfidenceLevel
  restaurantExperience?: RestaurantExperience
  currentRole?: CurrentRole
  hasExistingCertification?: boolean
  courseReason?: CourseReason
  learningStyle?: LearningStyle
}

// ─── Step configuration ──────────────────────────────────────────────────────

interface StepConfig {
  id: string
  getPrompt: (answers: PartialAnswers) => string
  inputType: InputType
  getInputProps: (answers: PartialAnswers) => Record<string, unknown>
  processAnswer: (answers: PartialAnswers, value: string | number | Date | null) => PartialAnswers
  formatAnswer: (value: string | number | Date | null, answers: PartialAnswers) => string
}

const s = en.onboarding.steps

const STEPS: StepConfig[] = [
  // 1 · Name
  {
    id: 'name',
    getPrompt: () => s.name.prompt,
    inputType: 'text',
    getInputProps: () => ({ placeholder: s.name.placeholder }),
    processAnswer: (answers, value) => ({ ...answers, name: String(value) }),
    formatAnswer: (value) => String(value),
  },

  // 2 · Phone
  {
    id: 'phone',
    getPrompt: (answers) => s.phone.prompt.replace('{name}', answers.name ?? ''),
    inputType: 'phone',
    getInputProps: () => ({}),
    processAnswer: (answers, value) => ({ ...answers, phone: String(value) }),
    formatAnswer: (value) => String(value),
  },

  // 3 · OTP
  {
    id: 'otp',
    getPrompt: (answers) => s.otp.prompt.replace('{phone}', answers.phone ?? ''),
    inputType: 'otp',
    getInputProps: () => ({}),
    processAnswer: (answers) => answers,
    formatAnswer: () => en.onboarding.inputs.verified,
  },

  // 4 · Preferred time of day
  {
    id: 'timeOfDay',
    getPrompt: () => s.timeOfDay.prompt,
    inputType: 'options',
    getInputProps: () => ({
      ariaLabel: 'When do you prefer to study?',
      options: [
        { label: s.timeOfDay.options.morning, value: 'morning' },
        { label: s.timeOfDay.options.afternoon, value: 'afternoon' },
        { label: s.timeOfDay.options.evening, value: 'evening' },
        { label: s.timeOfDay.options['no-preference'], value: 'no-preference' },
      ],
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      preferredTimeOfDay: value as TimeOfDay,
    }),
    formatAnswer: (value) =>
      s.timeOfDay.options[value as keyof typeof s.timeOfDay.options] ?? String(value),
  },

  // 5 · Completion deadline
  {
    id: 'deadline',
    getPrompt: () => s.deadline.prompt,
    inputType: 'date',
    getInputProps: () => ({ canSkip: true, minDate: new Date() }),
    processAnswer: (answers, value) => ({
      ...answers,
      completionDeadline:
        value instanceof Date ? value.toISOString().split('T')[0] : null,
    }),
    formatAnswer: (value) =>
      value instanceof Date
        ? value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : s.deadline.skip,
  },

  // 6 · Daily minutes
  {
    id: 'dailyMinutes',
    getPrompt: () => s.dailyMinutes.prompt,
    inputType: 'slider',
    getInputProps: () => ({
      min: 5,
      max: 30,
      step: 5,
      defaultValue: 15,
      formatLabel: (v: number) => `${v} min`,
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      dailyMinutes: Number(value) as DailyMinutes,
    }),
    formatAnswer: (value) => `${value} min`,
  },

  // 7 · Days per week
  {
    id: 'daysPerWeek',
    getPrompt: () => s.daysPerWeek.prompt,
    inputType: 'slider',
    getInputProps: () => ({
      min: 1,
      max: 7,
      step: 1,
      defaultValue: 3,
      formatLabel: (v: number) => `${v} day${v > 1 ? 's' : ''}`,
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      daysPerWeek: Number(value) as DaysPerWeek,
    }),
    formatAnswer: (value) => `${value} day${Number(value) > 1 ? 's' : ''}`,
  },

  // 8 · Confidence level
  {
    id: 'confidence',
    getPrompt: () => s.confidence.prompt,
    inputType: 'slider',
    getInputProps: () => ({
      min: 1,
      max: 10,
      step: 1,
      defaultValue: 5,
      formatLabel: (v: number) => String(v),
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      confidenceLevel: Number(value) as ConfidenceLevel,
    }),
    formatAnswer: (value) => `${value} / 10`,
  },

  // 9 · Restaurant experience
  {
    id: 'experience',
    getPrompt: () => s.experience.prompt,
    inputType: 'options',
    getInputProps: () => ({
      ariaLabel: 'How long have you worked in a restaurant?',
      options: [
        { label: s.experience.options.never, value: 'never' },
        { label: s.experience.options['less-than-a-year'], value: 'less-than-a-year' },
        { label: s.experience.options['1-3-years'], value: '1-3-years' },
        { label: s.experience.options['3-plus-years'], value: '3-plus-years' },
      ],
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      restaurantExperience: value as RestaurantExperience,
    }),
    formatAnswer: (value) =>
      s.experience.options[value as keyof typeof s.experience.options] ?? String(value),
  },

  // 10 · Current role
  {
    id: 'currentRole',
    getPrompt: () => s.currentRole.prompt,
    inputType: 'options',
    getInputProps: () => ({
      ariaLabel: 'What is your current role?',
      options: [
        { label: s.currentRole.options.server, value: 'server' },
        { label: s.currentRole.options['cook-or-prep-cook'], value: 'cook-or-prep-cook' },
        { label: s.currentRole.options.manager, value: 'manager' },
        { label: s.currentRole.options['new-hire'], value: 'new-hire' },
        { label: s.currentRole.options['not-yet-working'], value: 'not-yet-working' },
      ],
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      currentRole: value as CurrentRole,
    }),
    formatAnswer: (value) =>
      s.currentRole.options[value as keyof typeof s.currentRole.options] ?? String(value),
  },

  // 11 · Existing certification
  {
    id: 'certification',
    getPrompt: () => s.certification.prompt,
    inputType: 'options',
    getInputProps: () => ({
      ariaLabel: 'Do you have an existing certification?',
      options: [
        { label: s.certification.options.yes, value: 'yes' },
        { label: s.certification.options.no, value: 'no' },
      ],
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      hasExistingCertification: value === 'yes',
    }),
    formatAnswer: (value) => (value === 'yes' ? s.certification.options.yes : s.certification.options.no),
  },

  // 12 · Course reason
  {
    id: 'reason',
    getPrompt: () => s.reason.prompt,
    inputType: 'options',
    getInputProps: () => ({
      ariaLabel: "What's your reason for taking this course?",
      options: [
        { label: s.reason.options['required-by-employer'], value: 'required-by-employer' },
        { label: s.reason.options['want-to-learn'], value: 'want-to-learn' },
        { label: s.reason.options['renewing-certification'], value: 'renewing-certification' },
        { label: s.reason.options['preparing-for-new-job'], value: 'preparing-for-new-job' },
      ],
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      courseReason: value as CourseReason,
    }),
    formatAnswer: (value) =>
      s.reason.options[value as keyof typeof s.reason.options] ?? String(value),
  },

  // 13 · Learning style
  {
    id: 'learningStyle',
    getPrompt: () => s.learningStyle.prompt,
    inputType: 'options',
    getInputProps: () => ({
      ariaLabel: 'How do you prefer to learn?',
      options: [
        { label: s.learningStyle.options['step-by-step'], value: 'step-by-step' },
        { label: s.learningStyle.options['dive-straight-in'], value: 'dive-straight-in' },
        { label: s.learningStyle.options['quick-overview-first'], value: 'quick-overview-first' },
      ],
    }),
    processAnswer: (answers, value) => ({
      ...answers,
      learningStyle: value as LearningStyle,
    }),
    formatAnswer: (value) =>
      s.learningStyle.options[value as keyof typeof s.learningStyle.options] ?? String(value),
  },
]

// ─── Build final OnboardingAnswers from partial ───────────────────────────────

function buildFinalAnswers(partial: PartialAnswers): OnboardingAnswers {
  return {
    profile: {
      name: partial.name ?? '',
      phone: partial.phone ?? '',
      otpStep: 'verified',
    },
    schedule: {
      preferredTimeOfDay: partial.preferredTimeOfDay ?? 'no-preference',
      completionDeadline: partial.completionDeadline ?? null,
      dailyMinutes: partial.dailyMinutes ?? 15,
      daysPerWeek: partial.daysPerWeek ?? 3,
    },
    priorKnowledge: {
      confidenceLevel: partial.confidenceLevel ?? 5,
      restaurantExperience: partial.restaurantExperience ?? 'never',
      currentRole: partial.currentRole ?? 'not-yet-working',
      hasExistingCertification: partial.hasExistingCertification ?? false,
    },
    motivation: {
      courseReason: partial.courseReason ?? 'want-to-learn',
      learningStyle: partial.learningStyle ?? 'step-by-step',
    },
  }
}

// ─── ID counter ───────────────────────────────────────────────────────────────

let _id = 0
function nextId() {
  return `msg-${++_id}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [answers, setAnswers] = useState<PartialAnswers>({})

  // We track answers in a ref too so the submit handler always has the latest
  // value without depending on state that may close over a stale snapshot.
  const answersRef = useRef<PartialAnswers>({})

  // Trigger assistant typing + message reveal whenever the step changes.
  useEffect(() => {
    const step = STEPS[stepIndex]
    if (!step) return

    setShowInput(false)
    setIsTyping(true)

    const timer = setTimeout(() => {
      const prompt = step.getPrompt(answersRef.current)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', content: prompt },
      ])
      setShowInput(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [stepIndex])

  const handleSubmit = useCallback(
    (value: string | number | Date | null) => {
      const step = STEPS[stepIndex]
      if (!step) return

      // Add user bubble
      const displayText = step.formatAnswer(value, answersRef.current)
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: displayText },
      ])

      // Update answers
      const updatedAnswers = step.processAnswer(answersRef.current, value)
      answersRef.current = updatedAnswers
      setAnswers(updatedAnswers)
      setShowInput(false)

      const nextIndex = stepIndex + 1

      if (nextIndex >= STEPS.length) {
        // All questions answered — show completion message then log
        setIsTyping(true)
        setTimeout(() => {
          const completionPrompt = s.complete.prompt.replace(
            '{name}',
            updatedAnswers.name ?? ''
          )
          setIsTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: nextId(), role: 'assistant', content: completionPrompt },
          ])

          const finalAnswers = buildFinalAnswers(updatedAnswers)
          console.log('[Learning Loop] Onboarding complete:', finalAnswers)
        }, 1500)
      } else {
        setStepIndex(nextIndex)
      }
    },
    [stepIndex]
  )

  const currentStep = STEPS[stepIndex]

  return (
    <OnboardingLayout>
      <ChatContainer
        thread={<ChatThread messages={messages} isTyping={isTyping} />}
        input={
          showInput && currentStep ? (
            <InputArea
              key={stepIndex}
              type={currentStep.inputType}
              onSubmit={handleSubmit}
              inputProps={currentStep.getInputProps(answers)}
            />
          ) : null
        }
      />
    </OnboardingLayout>
  )
}
