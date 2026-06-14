'use client'

import { useState } from 'react'
import OnboardingCard from '@/app/components/onboarding/OnboardingCard'
import SettingsDashboard from '@/app/components/onboarding/SettingsDashboard'
import PhoneInput from '@/app/components/inputs/PhoneInput'
import OTPInput from '@/app/components/inputs/OTPInput'
import TextInput from '@/app/components/inputs/TextInput'
import en from '@/app/messages/en.json'
import type { SettingsValues } from '@/app/components/onboarding/SettingsDashboard'

export type OnboardingStep = 'phone' | 'otp' | 'name' | 'settings'

export interface OnboardingProfile {
  name: string
  settings: SettingsValues
}

export interface OnboardingFlowProps {
  onComplete: (profile: OnboardingProfile) => void
}

const MOCK_VALIDATION_DELAY_MS = 1000

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>('phone')
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [phoneForPrompt, setPhoneForPrompt] = useState('')
  const [otpError, setOtpError] = useState<string | undefined>()
  const [otpDisabled, setOtpDisabled] = useState(false)
  const [name, setName] = useState('')

  const cards = en.onboarding.cards

  const handlePhoneSubmit = (e164: string) => {
    setPhoneForPrompt(phoneDisplay)
    setStep('otp')
  }

  const handleOtpComplete = (code: string) => {
    setOtpDisabled(true)
    setOtpError(undefined)
    // Mocked: accept any 6-digit code after a brief simulated network delay
    setTimeout(() => {
      setOtpDisabled(false)
      setStep('name')
    }, MOCK_VALIDATION_DELAY_MS)
  }

  const handleResend = () => {
    setOtpError(undefined)
  }

  const handleNameSubmit = (value: string) => {
    setName(value)
    setStep('settings')
  }

  const handleSettingsSave = (settings: SettingsValues) => {
    onComplete({ name, settings })
  }

  if (step === 'phone') {
    return (
      <OnboardingCard title={cards.phone.title} prompt={cards.phone.prompt}>
        <PhoneInput
          value={phoneDisplay}
          onChange={setPhoneDisplay}
          onSubmit={handlePhoneSubmit}
        />
      </OnboardingCard>
    )
  }

  if (step === 'otp') {
    return (
      <OnboardingCard
        title={cards.otp.title}
        prompt={cards.otp.prompt.replace('{phone}', phoneForPrompt)}
      >
        <OTPInput
          onComplete={handleOtpComplete}
          onResend={handleResend}
          disabled={otpDisabled}
          error={otpError}
        />
      </OnboardingCard>
    )
  }

  if (step === 'name') {
    return (
      <OnboardingCard title={cards.name.title} prompt={cards.name.prompt}>
        <TextInput
          value={name}
          onChange={setName}
          onSubmit={handleNameSubmit}
          placeholder={en.onboarding.inputs.namePlaceholder}
          autoFocus
        />
      </OnboardingCard>
    )
  }

  return <SettingsDashboard onSave={handleSettingsSave} />
}
