'use client'

import { useState } from 'react'
import OnboardingLayout from '@/app/components/layouts/OnboardingLayout'
import OnboardingFlow from '@/app/components/onboarding/OnboardingFlow'
import type { OnboardingProfile } from '@/app/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  const [completed, setCompleted] = useState(false)

  const handleComplete = (profile: OnboardingProfile) => {
    console.log('[Learning Loop] Onboarding complete:', profile)
    setCompleted(true)
  }

  if (completed) {
    return (
      <OnboardingLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center px-4">
          <h1 className="text-2xl font-semibold text-gray-900">You're all set!</h1>
          <p className="text-sm text-gray-500">Your personalized learning plan is ready.</p>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout>
      <div className="flex flex-col justify-center min-h-screen px-4 py-10">
        <OnboardingFlow onComplete={handleComplete} />
      </div>
    </OnboardingLayout>
  )
}
